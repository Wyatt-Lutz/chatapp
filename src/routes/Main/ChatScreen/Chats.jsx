import { useContext, useState, useEffect, useRef } from "react";
import { ChatContext } from "../../../ChatProvider";
import { AuthContext } from "../../../AuthProvider";
import { db } from "../../../../firebase";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { ref, query, set, get, update, orderByValue, off, endBefore, startAt, limitToLast, endAt, child, push, orderByChild, equalTo, onValue, onChildAdded, remove } from 'firebase/database'



const Chats = () => {


  const { register, handleSubmit, resetField } = useForm();
  const { data } = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);
  const queryClient = useQueryClient();
  const numChatsPerPage = 10;
  const messagesContainerRef = useRef(null);
  const initialMount = useRef(true);
  const [clicked, setClicked] = useState(false);
  const [points, setPoints] = useState({x: 0, y: 0});
  const [editState, setEditState] = useState({});
  const [contextMenuData, setContextMenuData] = useState(null);
  const chatsRef = ref(db, "messages/" + data.chatID + "/");
  const endTimestamp = useRef(0);
  const userSentChat = useRef(false);
  const numUnread = useRef(0);
  const otherUserSentChat = useRef(false);



  const chatData = useQuery({
    enabled: false,
    refetchOnWindowFocus: false,
    queryKey: [data.chatID],
  });



  const fetchChats = async() => {
    const preScrollHeight = messagesContainerRef.current.scrollHeight;
    console.info('fetchChats run');
    const messageQuery = query(chatsRef, orderByChild('timestamp'), endBefore(endTimestamp.current), limitToLast(numChatsPerPage));
    const snap = await get(messageQuery);
    if (!snap.exists()) {
      console.log('no message data');
      return [];
    }
    const messageData = []
    snap.forEach((child) => {
      messageData.push(child.val());
    })

    endTimestamp.current = messageData[0].timestamp;

    queryClient.setQueryData([data.chatID], [...messageData, ...queryClient.getQueryData([data.chatID])]);

    const postScrollOffset = messagesContainerRef.current.scrollTop;
    const postScrollHeight = messagesContainerRef.current.scrollHeight;
    const deltaHeight = (postScrollHeight - preScrollHeight);
    messagesContainerRef.current.scrollTop = postScrollOffset + deltaHeight;

  }

  useEffect(() => {
    if (!data.chatID) {
      console.info("chatID undefined");
      return;
    }
    const handleNewMessageAdded = async(snap) => {
      console.info('handleNewMessageAdded run');
      if (!snap.exists()) {
        console.log('no message data');
        return [];
      }
      otherUserSentChat.current = true;
      const messageData = []
      snap.forEach((child) => {
        messageData.push(child.val());
      })
      endTimestamp.current = messageData[0].timestamp;
      console.log(messageData);

      queryClient.setQueryData([data.chatID], [...messageData]);


    }
    const messageQuery = query(chatsRef, orderByChild('timestamp'), limitToLast(numChatsPerPage));
    const unsub = onValue(messageQuery, handleNewMessageAdded);

    return () => {
      unsub();
    }

  }, [data.chatID]);


  const editMessage = async(id, text, index) => {
    setEditState({id: false});
    resetField('editMessage');

    console.log(text);
    console.log(id);
    const chatRef = ref(db, "messages/" + data.chatID + "/" + id);

    await update(chatRef, {
      text: text
    });
  }


  const deleteMessage = async(id) => {
    console.log(id);
    const chatRef = ref(db, "messages/" + data.chatID + "/" + id);
    await remove(chatRef);
  }


  const addMessage = async({text}) => {
    userSentChat.current = true;
    resetField('text');
    console.info('added message to database');
    const messageID = uuidv4();
    let renderTimeAndSender = true;
    if (chatData.data) {
      const previousMessage = chatData.data[chatData.data.length - 1];
      if (previousMessage.sender === currUser.displayName && Date.now() - previousMessage.timestamp < 300000) {
        renderTimeAndSender = false;
      }
    }



    const chatRef = ref(db, "messages/" + data.chatID + "/" + messageID);
    await update(chatRef, {
      timestamp: Date.now(),
      text: text,
      id: messageID,
      sender: currUser.displayName,
      renderTimeAndSender: renderTimeAndSender,
    })

  };


  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }
    const isScrolledToBottom = (container.scrollHeight - container.scrollTop - container.clientHeight < 1);
    console.log('isScrolledToBottom: '+ isScrolledToBottom);
    console.log('userSentChat: ' + userSentChat.current);
    if ((userSentChat.current || initialMount.current || (otherUserSentChat.current && isScrolledToBottom)) && chatData.data) {
      console.log('scrolled to bottom')
      container.scrollTop = container.scrollHeight;
      userSentChat.current = false;
      initialMount.current = false;
      otherUserSentChat.current = false;
    }

  }, [chatData]);


  const calcTime = (time) => {
    const currTime = Date.now();
    const formattedTime = dayjs(time).format('h:mm A');
    if (currTime - time < 86400000) {
      return 'Today at ' + formattedTime;
    } else if (currTime - time < 172800000 ) {
      return 'Yesterday at' + formattedTime;
    }
    return dayjs(time).format('MM/DD/YYYY h:m A');
  }




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

    const handleScroll = debounce(async() => {
      if (messagesContainerRef.current.scrollTop <= 100) {
        await fetchChats();
      }
    }, 300);

    messagesContainerRef.current.addEventListener('scroll', handleScroll);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
      messagesContainerRef.current.removeEventListener('scroll', handleScroll);
    };
  }, [])

/*

*/


  return(
    <section className="w-full">
      <div ref={messagesContainerRef} className="overflow-y-auto max-h-[400px] overflow-hidden no-scrollbar w-full">
          <div>
            {chatData.isError ? (
              <div>{chatData.error}</div>
            ) : (
              <div>
                {chatData.data?.map((chat, index) => (
                  <div onContextMenu={(e) => handleContextMenu(e, chat)} className="hover:bg-gray-600" key={chat.id}>
                    <div className="flex w-full">
                    {chat.renderTimeAndSender && (
                      <div className="flex">
                        <div>{chat.sender}</div>
                        <div>{calcTime(chat.timestamp)}</div>

                      </div>

                    )}

                    </div>

                    {editState[chat.id] ? (
                      <form onSubmit={handleSubmit((text) => editMessage(chat.id, text.editMessage, index))}>
                        <input placeholder={chat.text} {...register('editMessage', { required: false, maxLength: 200 })} />
                      </form>

                    ) : (
                      <div className="text-xl font-bold py-2 w-max">{chat.text}</div>
                    )}

                  </div>
                ))}
              </div>
            )}


          <form onSubmit={handleSubmit((text) => addMessage(text))}>
            <input placeholder="Type here..." {...register('text', { required: false, maxLength: 200})} />

          </form>

          <button onClick={fetchChats}>Load more</button>
        </div>


      </div>
      {clicked && (
        <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points.y, left: points.x}}>
          <button onClick={() => setEditState((prev) => ({...prev, [contextMenuData.chatID]: true }))}>Edit</button>
          <button onClick={() => deleteMessage(contextMenuData.chatID)}>Delete</button>
        </div>
      )}




    </section>
  )
}

export default Chats;
