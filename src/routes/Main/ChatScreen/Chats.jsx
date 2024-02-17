import { useContext, useState, useEffect, useRef } from "react";
import { ChatContext } from "../../../ChatProvider";
import { AuthContext } from "../../../AuthProvider";
import { onSnapshot, doc, getDoc, orderBy, limit, arrayRemove, setDoc, getDocs, collection, Timestamp, arrayUnion, updateDoc, query, startAfter, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";
import { initializeApp } from "firebase/app";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";




const Chats = () => {


  const { register, handleSubmit, resetField } = useForm();
  const { data } = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const initialRun = useRef(true);
  const numChatsPerDoc = 10;
  const numChats = useRef(0);
  const messagesContainerRef = useRef(null);
  const initialFetch = useRef(true);
  const lastChatID = useRef(data.chatID);
  const [clicked, setClicked] = useState(false);
  const [points, setPoints] = useState({x: 0, y: 0});
  const [editState, setEditState] = useState({});
  const [contextMenuData, setContextMenuData] = useState(null);
  const numChatsInDocZero = useRef(0);



  const fetchMoreChats = async() => {
    try {
      if (!data.chatID) {
        console.log('No chatID, fetch more chats should not run');
        return;
      }

      const messagesRef = collection(db, "chats", data.chatID, "messages");
      const querySnapshot = await getDocs(messagesRef);
      const storedChats = querySnapshot.docs.map(doc => doc.data());
      const nextMessageSet = storedChats[storedChats.length - numChats.current]?.messages;
      let currMessages;

      if (numChats.current > 0 && numChats.current < storedChats.length && nextMessageSet) {
        currMessages = nextMessageSet;
        console.log('sucessfully grabed more chats');

        queryClient.setQueryData([data.chatID], [...currMessages, ...queryClient.getQueryData([data.chatID])]);
      } else if (numChats.current === 0) {
        console.log('numChats is 0')
        currMessages = storedChats[0]?.messages;
        currMessages = currMessages.slice(Math.max(currMessages.length - numChatsPerDoc, 0), currMessages.length);
        //queryClient.setQueryData([data.chatID], currMessages);
        return currMessages;

      } else {
        console.log ('no more chats to load');//toast -- would be more just nothing happens because scroll
        numChats.current -= 1;
        return;
      }

      if (currMessages && Object.keys(currMessages).length < 1) {
        console.info('no chats in chat');
        return;
      }

    } catch (error) {
      console.error(error);
    }


  }

  const chatData = useQuery({
    queryKey: [data.chatID],
    queryFn: () => fetchMoreChats(),
  });

  useEffect(() => {
    if (chatData.isPending) {

    }
    if (chatData.isError) {
      console.error(chatData.error);
    }
  }, [chatData]);
  /*


  */

  const addMessageMutation = useMutation({
    mutationFn: ({text}) => {
      addMessage(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [data.chatID]})
    },
  });

  const editMessageMutation = useMutation({
    mutationFn: ({id, text}) => {
      editMessage(id, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [data.chatID]});
    }
  })

  const deleteMessageMutation = useMutation({
    mutationFn: (id) => {
      deleteMessage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [data.chatID]});
    }
  })

  const editMessage = async(id, text) => {
    //error was that it was loading the same chats twice when load more chats was clicked twice
    setEditState({id: false});

    const queryIndex = chatData.data.findIndex((chat) => chat.id === id);
    const docNumber = Math.trunc(queryIndex/(numChatsInDocZero.current + numChatsPerDoc));


    console.log(docNumber);
  }

  const deleteMessage = async(id) => {
    console.log(id);

  }







  const reallocateData = async () => {
    try {
      const messagesRef = collection(db, "chats", data.chatID, "messages");
    const querySnapshot = await getDocs(messagesRef);
    const storedChats = querySnapshot.docs.map(doc => doc.data());
    const currMessages = storedChats[0]?.messages;
    if (Object.keys(currMessages).length < 1) {
      return;
    }
    const numOfExcess = currMessages.length - numChatsPerDoc;
    if (numOfExcess > 0) {
      console.info("ran message reallocation process")
      const nowOldMessagesInCurr = currMessages.slice(0, currMessages.length - numChatsPerDoc);
      const nextChatBlockLeft = numChatsPerDoc - storedChats[storedChats.length-1]?.messages.length;
      console.log("nextChatBlockLeft: " + nextChatBlockLeft);
      if (nextChatBlockLeft !== null && nextChatBlockLeft > 0) {
        console.log('filled last doc')
        await updateDoc(doc(messagesRef, (querySnapshot.docs.length - 1).toString()), {
          messages: arrayUnion(...currMessages.slice(0, Math.min(numOfExcess, nextChatBlockLeft))),
        });
      }
      for (let i = 0; i < Math.ceil((numOfExcess - Math.max(nextChatBlockLeft, 0))/numChatsPerDoc); i++) {
        console.log('loop run')
        const nextMessages = currMessages.slice((Math.max(nextChatBlockLeft, 0) + (numChatsPerDoc * i)), (numOfExcess * (i + 1)));
        console.log(nextMessages);
        await setDoc(doc(messagesRef, (querySnapshot.docs.length).toString()), {
          messages: nextMessages,
        })
      }

      await updateDoc(doc(messagesRef, "0"), {
        messages: arrayRemove(...nowOldMessagesInCurr),
      });
    }


    } catch (error) {
      console.error(error);
    }

  }







  useEffect(() => {


    if (!data.chatID) {
      console.info("chatID undefined");
      return;
    }
    initialRun.current = true;
    console.info('reset message data');
    const chatRef = doc(db, "chats", data.chatID, "messages", "0");
    const chatListener = onSnapshot(chatRef, (snap) => {
      const messages = snap.data().messages;
      if(Object.keys(messages).length < 1) {
        //no chats in database
        return;
      }
      if (initialFetch.current) {
        console.info('subscribed to chatListener')
        initialFetch.current = false;
        return;
      }
      if (lastChatID.current !== data.chatID) {
        lastChatID.current = data.chatID;
        return;
      }
      console.info("chat listener ran");
      console.log(messages);
      queryClient.setQueryData([data.chatID], messages);

    }, (error) => console.error(error));

    reallocateData();

    return () => chatListener();


  }, [data.chatID]);


  const addMessage = async(text) => {
    resetField('text');
    numChatsInDocZero.current += 1;
    console.info('added message to database')
    const chatID = uuidv4();


//Remember to add back rweact query (well think about it first, think trhough it)
//and also remember bug with adding same person to chat
    await updateDoc(doc(db, "chats", data.chatID, "messages", "0"), {
      messages: arrayUnion({
        text: text,
        id: chatID,
        date: Date.now(),
        sender: currUser.displayName,
      })
    });
    return chatData;

  };

/*
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatData]);
*/

  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setClicked(true);

    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({ chatID: chat.id, text: chat.text });
    console.log('right cliecked');
  }

  useEffect(() => {
    const handleClick = () => {
      setClicked(false);
      setContextMenuData(null);
    }
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [])




  return(
    <section>
      <div ref={messagesContainerRef} className="overflow-y-auto max-h-[400px] overflow-hidden no-scrollbar">
          <div>
            {chatData.data && chatData.data.length > 0 && chatData.data.map((chat) => (

                <div onContextMenu={(e) => handleContextMenu(e, chat)} className="hover:bg-gray-600" key={chat.id}>
                  <div className="flex">
                    <div>{chat.sender}</div>
                    <div>{dayjs(chat.date).format('MM/DD/YYYY h:m A')}</div>
                  </div>

                  {editState[chat.id] ? (
                    <form onSubmit={handleSubmit((text) => editMessageMutation.mutate({id: chat.id, text}))}>
                      <input placeholder={chat.text} {...register('editMessage', { required: false, maxLength: 200 })} />

                    </form>

                  ) : (
                    <div className="text-xl font-bold py-2" key={chat.id}>{chat.text}</div>
                  )}

                </div>


            ))}

          <form onSubmit={handleSubmit((data) => addMessageMutation.mutate(data))}>
            <input placeholder="Type here..." {...register('text', { required: false, maxLength: 200})} />

          </form>

          <button onClick={() => {numChats.current += 1; fetchMoreChats();}}>Load more</button>
        </div>





      </div>
      {clicked && (
        <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points.y, left: points.x}}>
          <button onClick={() => setEditState((prev) => ({...prev, [contextMenuData.chatID]: true }))}>Edit</button>
          <button onClick={() => deleteMessageMutation.mutate(contextMenuData.chatID)}>Delete</button>
        </div>
      )}




    </section>
  )
  //editMessageMutation.mutate({ id: contextMenuData.chatID, text: contextMenuData.text })
}

export default Chats;
