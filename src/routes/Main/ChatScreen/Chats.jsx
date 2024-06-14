import { useContext, useState, useMemo, useCallback, useEffect, useRef, Fragment} from "react";
import { ChatContext } from "../../../ChatProvider";
import { AuthContext } from "../../../AuthProvider";
import { db } from "../../../../firebase";
import { useForm } from "react-hook-form";
import { debounce } from 'lodash';
import dayjs from "dayjs";
import { useElementOnScreen } from "../../../IntersectionObserver";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { ref, onChildAdded, onChildChanged, onChildRemoved, query, orderByChild, startAt, limitToLast, update } from 'firebase/database'
import {fetchChats, addMessage, editMessage, deleteMessage, editTitle, updateUserOnlineStatus} from './useChatData';


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
  const [isEditingTitle, setIsEditingTitle] = useState(false);


  const [containerRef, isVisible] = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 1,
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



  const handleChildAdded = useCallback((snap) => {
    const existingData = queryClient.getQueryData(['messsages', data.chatID]) ?? [];
    if (existingData.length === 1) {
      endTimestamp.current = existingData.messages[0].timestamp;
    }
    queryClient.setQueryData(['messsages', data.chatID], [...existingData, snap.val()]);

    if (!atBottom) {
      setUnread(prev => prev + 1);
    }



  }, [data.chatID]);

  const handleChildChanged = useCallback((snap) => {
    const existingData = queryClient.getQueryData(['messsages', data.chatID]) ?? [];
    const updatedData = existingData.map((chat) =>
      chat.id === snap.key ? snap.val() : chat
    );

    queryClient.setQueryData(['messsages', data.chatID], updatedData);

  }, [data.chatID]);

  const handleChildRemoved = useCallback((snap) => {
    const existingData = queryClient.getQueryData(['messsages', data.chatID]) ?? [];
    const updatedData = existingData.filter((chat) => chat.id !== snap.key);
    queryClient.setQueryData(['messsages', data.chatID], updatedData);
  }, [data.chatID]);

  const handleMemberAdded = useCallback((snap) => {
    const existingData = queryClient.getQueryData(['members', data.chatID]) ?? [];
    queryClient.setQueryData(['members', data.chatID], [...existingData, snap.key]);
  }, [data.chatID]);

  const handleMemberChanged = useCallback((snap) => {
    const existingData = queryClient.getQueryData(['members', data.chatID]) ?? [];
    console.log(snap.val());
    console.log(snap.key);
  }, [data.chatID])

  const handleMemberRemoved = useCallback((snap) => {
    const existingData = queryClient.getQueryData(['members', data.chatID]) ?? [];
    const updatedData = existingData.members.filter((member) => member.key !== snap.key);
    queryClient.setQueryData(['members', data.chatID], updatedData);
  }, [data.chatID])




  useEffect(() => {
    if (!data.chatID) {
      console.info("chatID undefined");
      return;
    }
    updateUserOnlineStatus(true, db, data.chatID, currUser.displayName, currUser.uid);

    const addedListenerQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp.current), limitToLast(10));
    const otherListenersQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp.current));

    const membersRef  = ref(db, "members/" + data.chatID);
    const memberAddedListener = onChildAdded(membersRef, handleMemberAdded);
    const memberChangedListener = onChildChanged(membersRef, handleMemberChanged);
    const memberRemovedListener = onChildRemoved(membersRef, handleMemberRemoved);


    const childAddedListener = onChildAdded(addedListenerQuery, handleChildAdded);
    const childChangedListener = onChildChanged(otherListenersQuery, handleChildChanged);
    const childRemovedListener = onChildRemoved(otherListenersQuery, handleChildRemoved);


    const container = messagesContainerRef.current;

    window.addEventListener("click", handleClick);
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", updateUserOnlineStatus(false, db, data.chatID, currUser.displayName, currUser.uid));
    return () => {
      childAddedListener();
      childChangedListener();
      childRemovedListener();
      memberAddedListener();
      memberChangedListener();
      memberRemovedListener();
      window.removeEventListener("click", handleClick);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", updateUserOnlineStatus(false, db, data.chatID, currUser.displayName, currUser.uid));
      updateUserOnlineStatus(false, db, data.chatID, currUser.displayName, currUser.uid);
    }
  }, [data.chatID]);


  const calcTime = (time) => {
    const formattedTime = dayjs(time).format('h:mm A');
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayMidnight = new Date(todayMidnight);
    yesterdayMidnight.setDate(todayMidnight.getDate() - 1);
    if (time - todayMidnight.getTime() > 0) {
      return 'Today at ' + formattedTime;
    } else if (time - yesterdayMidnight.getTime() > 0) {
      return 'Yesterday at' + formattedTime;
    }
    return dayjs(time).format('MM/DD/YYYY h:m A');
  }


  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setClicked(true);

    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({ chatID: chat.id, text: chat.text, sender: chat.sender });
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
    let renderTimeAndSender = true;
    if (chatData.data.messages && prevTimestamp) {
      const previousMessage = chatData.data.messages[chatData.data.messages.length - 1];
      if (previousMessage.sender === currUser.displayName && Date.now() - prevTimestamp < 180000) {
        renderTimeAndSender = false;
      }
    }

    const timeData = await addMessage(text.text, data.chatID, currUser.displayName, db, renderTimeAndSender);
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


  const onFinishEditTitle = async(text) => {

    resetField('title');
    setIsEditingTitle(false);
    if (text.title === "") {
      return;
    }
    await editTitle(text.title, data.chatID, db, currUser.displayName);

  }

  return(
    <section className="w-full">
      {isEditingTitle ? (
        <form onSubmit={handleSubmit(onFinishEditTitle)}>
          <input {...register('title', {required: false})} placeholder={data.title} onBlur={handleSubmit(onFinishEditTitle)}></input>
        </form>

      ) : (
        <div onMouseOver={() => setIsEditingTitle(true)}>{data.title}</div>
      )}
      <div ref={messagesContainerRef} className="overflow-y-auto max-h-[400px] no-scrollbar w-full flex flex-col-reverse scroll-smooth">
          <div className="flex-grow">
            {chatData.isError ? (
              <div>{chatData.error}</div>
            ) : (
              <div>

                {chatData.data?.messages?.map((chat, index) => (
                  <Fragment key={chat.id}>
                    <div onContextMenu={(e) => handleContextMenu(e, chat)} className="hover:bg-gray-600">
                      {(chat.renderTimeAndSender || index === 0) && (
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
                          <div>
                            <div className="text-xl font-bold py-2 w-max">{chat.text}</div>
                            {chat.hasBeenEdited && (
                              <div>Edited</div>
                            )}
                          </div>


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

        <div className="flex border min-h-10" ref={containerRef}></div>


      </div>
      {(clicked && contextMenuData.sender === currUser.displayName && contextMenuData.sender !== "server") && (
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
