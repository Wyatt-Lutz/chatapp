import { useContext, useState, useMemo, memo, useCallback, useEffect, useRef } from "react";
import { db } from "../../../../../firebase";
import { debounce } from 'lodash';
import { ref, onChildAdded, onChildChanged, onChildRemoved, query, orderByChild, startAt, limitToLast } from 'firebase/database';

import { ChatContext } from "../../../../ChatProvider";
import { AuthContext } from "../../../../AuthProvider";
import { useElementOnScreen } from "../../../../hooks/useIntersectionObserver";
import { fetchChats, updateUserOnlineStatus } from "../../../../services/messageDataService";
import { useContextMenu } from "../../../../hooks/useContextMenu";

import Message from "./Message"
import Input from "./Input";
import MessagesContextMenu from "./MessagesContextMenu";

const Messages = () => {
  const { data } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);

  const [chats, setChats] = useState([])
  const [scrolled, setScrolled] = useState(false);
  const [unread, setUnread] = useState(0);
  const [editState, setEditState] = useState({});
  const [contextMenuData, setContextMenuData] = useState({});

  const chatsRef = useMemo(() =>  ref(db, "messages/" + data.chatID + "/"));

  const endTimestamp = useRef(0);
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const atBottom = useRef(true);
  const clientSentChat = useRef(false);

  const { clicked, setClicked, points, setPoints } = useContextMenu();


  const [containerRef, isVisible] = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 1,
  });


  const handleChildAdded = (snap) => {
    console.log(snap.key);
    setChats(prev => {
      const fetchedMessageData = snap.val();
      fetchedMessageData.id = snap.key;
      const updatedChats = [...prev, fetchedMessageData];
      if (prev.length === 1) {
        endTimestamp.current = prev[0].timestamp;
      }
      return updatedChats;
    });

    if (!atBottom.current) {
      setUnread(prev => prev + 1);
    }

  };

  const handleChildChanged = (snap) => {

    setChats(prev => {
      const index = prev.findIndex(chat => chat.id === snap.key);
      if (index === -1) {
        return prev;
      }
      const updatedChats = [...prev];
      updatedChats[index] = snap.val();
      return updatedChats;
    });


  };

  const handleChildRemoved = (snap) => {

    setChats(prev => {
      const updatedChats = [...prev];
      updatedChats.filter(chat => chat.id !== snap.key);
      return updatedChats;
    });
  };



  useEffect(() => {
    if (!data.chatID) {
      console.info("chatID undefined");
      return;
    }

    updateUserOnlineStatus(true, db, data.chatID, currUser.uid);

    const addedListenerQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp.current), limitToLast(10));
    const otherListenersQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp.current));


    const chatAddedListener = onChildAdded(addedListenerQuery, handleChildAdded);
    const chatChangedListener = onChildChanged(otherListenersQuery, handleChildChanged);
    const chatRemovedListener = onChildRemoved(otherListenersQuery, handleChildRemoved);


    const container = messagesContainerRef.current;

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", handleUserOffline);
    return () => {
      chatAddedListener();
      chatChangedListener();
      chatRemovedListener();

      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUserOffline);
      console.log(data.chatID);
      handleUserOffline();
    }
  }, [data.chatID]);


  const handleUserOffline = useCallback(() => {
    updateUserOnlineStatus(false, db, data.chatID, currUser.uid);
  }, [data.chatID]);


  const calculateRenderTimeAndSender = useCallback(() => {
    clientSentChat.current = true;
    let renderTimeAndSender = true;
    const prevTimestamp = localStorage.getItem('timestamp');


    setChats(prev => {
      const previousMessage = prev[prev.length -1];

      if (prevTimestamp && previousMessage && previousMessage.sender === currUser.displayName && Date.now() - prevTimestamp < 180000) {
        renderTimeAndSender = false;
      }
      return prev;
    })

    return renderTimeAndSender;
  }, []);


  const handleScroll = useCallback(() => {
    setScrolled(true);
    if (messagesContainerRef.current.scrollTop !== 0 && (atBottom.current)) {
      atBottom.current = false;
    } else if (messagesContainerRef.current.scrollTop === 0 && (!atBottom.current)) {
      atBottom.current = true;
      setUnread(0);
    }

  }, []);


  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({ chatID: chat.id, text: chat.text, sender: chat.sender });
  }

  const handleFetchMore = debounce(async() => {
    const messageData = await fetchChats(endTimestamp.current, db, data.chatID);
    if (messageData.length === 0) {
      return;
    }
    messageData?.[0]?.timestamp && (endTimestamp.current = messageData[0].timestamp);
    setChats(prev => [...messageData, ...prev]);
  }, 300);



  useEffect(() => {
    if (isVisible && scrolled) {
      handleFetchMore();
    }
  }, [isVisible]);


  useEffect(() => {
    if(lastMessageRef.current && atBottom.current) {
      lastMessageRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [chats]);




  const changeEditState = useCallback((id, state) => {
    console.info('i ran')
    setEditState(prev => ({...prev, [id]: state}));
  }, [data.chatID]);


  return(
    <section className="w-full">




      <div ref={messagesContainerRef} className="overflow-y-auto max-h-[400px] no-scrollbar w-full flex flex-col-reverse scroll-smooth">
          <div className="flex-grow">

              <div>

                {chats?.map((chat, index) => (
                  <div key={chat.id}>

                    <div onContextMenu={(e) => handleContextMenu(e, chat)} className="hover:bg-gray-600">
                      <Message chat={chat} isFirst={index === 0} isEditing={editState[chat.id]} changeEditState={changeEditState}/>
                    </div>

                    {index === chats.length - 1 && (
                      <div ref = {lastMessageRef} />
                    )}

                  </div>



                ))}
              </div>

            <Input calculateRenderTimeAndSender={calculateRenderTimeAndSender} />
        </div>

        <div className="flex border min-h-10" ref={containerRef}></div>
      </div>
      {(clicked && contextMenuData.sender === currUser.displayName) && (
        <MessagesContextMenu changeEditState={changeEditState} contextMenuData={contextMenuData} points={points} />
      )}
      {unread > 0 && (
        <div>{unread} new messages</div>
      )}




    </section>
  )
}

export default memo(Messages);
