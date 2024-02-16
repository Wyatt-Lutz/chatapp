import { useContext, useState, useEffect, useRef } from "react";
import { ChatContext } from "../../../ChatProvider";
import { AuthContext } from "../../../AuthProvider";
import { onSnapshot, doc, getDoc, orderBy, limit, arrayRemove, setDoc, getDocs, collection, Timestamp, arrayUnion, updateDoc, query, startAfter, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";
import { initializeApp } from "firebase/app";
//import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";




const Chats = () => {
  const [messageData, setMessageData] = useState([]);
  const { register, handleSubmit, resetField } = useForm();
  const {data} = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);
  //const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const initialRun = useRef(true);
  const numChatsPerDoc = 10;
  const numChats = useRef(0);
  const messagesContainerRef = useRef(null);
  const initialFetch = useRef(true);



  const reallocateData = async () => {
    console.info('reallocated data');
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
    setMessageData(currMessages.slice(Math.max(currMessages.length - numChatsPerDoc, 0), currMessages.length));

  }


  const fetchMoreChats = async() => {
    numChats.current += 1;
    if (!data.chatID) {
      console.error('No chatID, fetch more chats should not run');
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
      setMessageData((prev) => [...currMessages, ...prev]);
    } else {
      console.log ('no more chats to load');//toast -- would be more just nothing happens because scroll
      numChats.current -= 1;
      return;
    }

    if (currMessages && Object.keys(currMessages).length < 1) {
      console.info('no chats in chat');
      return;
    }
  }


  useEffect(() => {


    if (!data.chatID) {
      console.info("chatID undefined");
      return;
    }
    setMessageData([]);
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
        setMessageData(messages.slice(Math.max(messages.length - numChatsPerDoc, 0), messages.length));
        initialFetch.current = false;
        return;
      }
      console.info("chat listener ran");
      console.log(messages);
      setMessageData(messages);

    }, (error) => console.error(error));

    reallocateData();

    return () => chatListener();


  }, [data.chatID]);


  const addMessage = async({text}) => {
    resetField('text');
    console.info('added message to database')
    const chatID = uuidv4();
    const date = dayjs();
    const chatDate = date.format('MM/DD/YYYY h:m A');
//Remember to add back rweact query (well think about it first, think trhough it)
//and also remember bug with adding same person to chat
    await updateDoc(doc(db, "chats", data.chatID, "messages", "0"), {
      messages: arrayUnion({
        text: text,
        id: chatID,
        date: chatDate,
        sender: currUser.displayName,
      })
    });

  };


  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messageData]);


  return(
    <div>

      {!data.chatID ? (
        <div>Friends online:</div> //firends online
      ) : (
        <div ref={messagesContainerRef} className="overflow-y-auto max-h-[400px] overflow-hidden no-scrollbar">
          <div>
            {messageData.length > 0 && messageData.map((chat) => (
              <div>
                <div className="flex">
                  <div>{chat.sender}</div>
                  <div>{chat.date}</div>
                </div>

                <div className="text-xl font-bold py-2" key={chat.id}>{chat.text}</div>
              </div>

            ))}

          <form onSubmit={handleSubmit(addMessage)}>
            <input placeholder="Type here..." {...register('text', { required: true, maxLength: 200})}></input>
          </form>

          <button onClick={() => fetchMoreChats()}>Load more</button>
        </div>





        </div>

      )}

    </div>
  )
}

export default Chats;
