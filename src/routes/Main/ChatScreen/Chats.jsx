import { useContext, useState, useMemo, useCallback, useEffect, useRef, Fragment} from "react";
import { ChatContext } from "../../../ChatProvider";
import { AuthContext } from "../../../AuthProvider";
import { db } from "../../../../firebase";
import { useForm } from "react-hook-form";
import { debounce } from 'lodash';
import dayjs from "dayjs";
import { useElementOnScreen } from "../../../IntersectionObserver";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { ref, onChildAdded, onChildChanged, onChildRemoved, query, orderByChild, startAt, limitToLast } from 'firebase/database'
import {fetchChats, addMessage, editMessage, deleteMessage, updateUserOnlineStatus} from './useChatData';


const Chats = () => {

  const { register, handleSubmit, resetField } = useForm();
  const { data } = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);
  const queryClient = useQueryClient();

  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [clicked, setClicked] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [points, setPoints] = useState({x: 0, y: 0});
  const [editState, setEditState] = useState({});
  const [contextMenuData, setContextMenuData] = useState(null);
  const chatsRef = useMemo(() =>  ref(db, "messages/" + data.chatID + "/"));
  const endTimestamp = useRef(0);
  const userSentChat = useRef(false);
  const [unread, setUnread] = useState(0);


  const [containerRef, isVisible] = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  });


  const chatData = useQuery({
    enabled: false,
    refetchOnWindowFocus: false,
    queryKey: [data.chatID],
  });


  const handleClick = useCallback(() => {
    setClicked(false);
    setContextMenuData(null);
  }, []);


  const handleScroll = useCallback(() => {
    setScrolled(true);
    if (messagesContainerRef.current.scrollTop !== 0 && atBottom) {
      setAtBottom(false);
    } else if (messagesContainerRef.current.scrollTop === 0 && !atBottom) {
      setAtBottom(true);
    }
  }, []);

  const handleUpdateUserStatus = useCallback(() => {
    updateUserOnlineStatus(false, db, data.chatID, currUser.uid);
  })

  const handleChildAdded = useCallback((snap) => {
    const existingData = queryClient.getQueryData([data.chatID]) ?? [];
    if (existingData.length === 1) {
      endTimestamp.current = existingData[0].timestamp;
    }
    queryClient.setQueryData([data.chatID], [...existingData, snap.val()]);
    setAtBottom(prevState => {
      if (!prevState) {
        setUnread(prev => prev + 1);
      }
      return prevState;
    })


  }, [data.chatID]);

  const handleChildChanged = useCallback((snap) => {
    const existingData = queryClient.getQueryData([data.chatID]) ?? [];
    const updatedData = existingData.map((chat) =>
      chat.id === snap.key ? snap.val() : chat
    );

    queryClient.setQueryData([data.chatID], updatedData);

  }, [data.chatID]);

  const handleChildRemoved = useCallback((snap) => {
    const existingData = queryClient.getQueryData([data.chatID]);
    const updatedData = existingData.filter((chat) => chat.id !== snap.key);
    queryClient.setQueryData([data.chatID], updatedData);
  }, [data.chatID]);



/*
I was finishing the unread messages implementation. I need to use the listener for the chatbar if someone deleted a chat for the if unread
count increase because the listener has reference at chatsIn so if it changes , look for both deleted chat and changed unread then update jsx
accodingly.


todo:
Add a listener to chatBar for if somebody else deletes a chat



*/

  useEffect(() => {
    if (!data.chatID) {
      console.info("chatID undefined");
      return;
    }
    updateUserOnlineStatus(true, db, data.chatID, currUser.uid);
    const addedListenerQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp.current), limitToLast(10));
    const childAddedListener = onChildAdded(addedListenerQuery, handleChildAdded);
    const otherListenersQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp.current))
    const childChangedListener = onChildChanged(otherListenersQuery, handleChildChanged);
    const childRemovedListener = onChildRemoved(otherListenersQuery, handleChildRemoved);
    const container = messagesContainerRef.current;
    window.addEventListener("click", handleClick);
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", handleUpdateUserStatus);
    return () => {
      childAddedListener();
      childChangedListener();
      childRemovedListener();
      window.removeEventListener("click", handleClick);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUpdateUserStatus);
      handleUpdateUserStatus();
    }
  }, [data.chatID]);


  const calcTime = (time) => {
    const currTime = Date.now()
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

  const handleFetchMore = useMemo(() => debounce(async() => {
      const messageData = await fetchChats(endTimestamp.current, db, data.chatID);
      messageData?.[0]?.timestamp && (endTimestamp.current = messageData[0].timestamp);
      queryClient.setQueryData([data.chatID], [...messageData, ...queryClient.getQueryData([data.chatID])]);
  }, 300), [data.chatID]);

  useEffect(() => {
    if (isVisible && scrolled) {
      handleFetchMore();
    }
  }, [isVisible]);

  const handleAddMessage = async(text) => {
    resetField('text');
    const prevTimestamp = localStorage.getItem('timestamp');
    const timeData = await addMessage(text, data.chatID, currUser.displayName, db, chatData, prevTimestamp);
    userSentChat.current = true;
    if (timeData.renderState) {
      localStorage.setItem('timestamp', timeData.time);
    }
  }

  useEffect(() => {

    if(lastMessageRef.current && atBottom) {
      lastMessageRef.current.scrollIntoView({behavior: 'smooth'});
    }

  }, [chatData.data]);





  return(
    <section className="w-full">
      <div ref={messagesContainerRef} className="overflow-y-auto max-h-[400px] no-scrollbar w-full flex flex-col-reverse scroll-smooth">
          <div className="flex-grow">
            {chatData.isError ? (
              <div>{chatData.error}</div>
            ) : (
              <div>

                {chatData.data?.map((chat, index) => (
                  <Fragment key={chat.id}>
                    <div onContextMenu={(e) => handleContextMenu(e, chat)} className="hover:bg-gray-600">
                      {chat.renderTimeAndSender && (
                            <div className="flex">
                              <div>{chat.sender}</div>
                              <div>{calcTime(chat.timestamp)}</div>

                            </div>

                        )}
                      <div className="flex flex-col w-full">



                        {editState[chat.id] ? (
                          <form onSubmit={handleSubmit((text) => {
                            resetField('editMessage');
                            editMessage(chat.id, text.editMessage, data.chatID, db);
                            setEditState({id: false});
                            })}
                          >
                            <input placeholder={chat.text} {...register('editMessage', { required: false, maxLength: 200 })} />
                          </form>

                        ) : (

                          <div className="text-xl font-bold py-2 w-max">{chat.text}</div>
                        )}


                      </div>
                    </div>
                    {index === chatData.data.length - 1 && (
                      <div ref = {lastMessageRef} />
                    )}

                  </Fragment>

                ))}
              </div>
            )}


          <form onSubmit={handleSubmit(handleAddMessage)}

          >
            <input placeholder="Type here..." {...register('text', { required: false, maxLength: 200})} />

          </form>
        </div>

        <div ref={containerRef}></div>
      </div>
      {clicked && (
        <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points.y, left: points.x}}>
          <button onClick={() => setEditState((prev) => ({...prev, [contextMenuData.chatID]: true }))}>Edit</button>
          <button onClick={() => deleteMessage(contextMenuData.chatID, db, data.chatID)}>Delete</button>
        </div>
      )}
      {unread > 0 && (
        <div>{unread} new messages</div>
      )}




    </section>
  )
}

export default Chats;
