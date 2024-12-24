import { useContext, useState, useMemo, memo, useCallback, useEffect, useRef } from "react";
import { db } from "../../../../../firebase";
import { debounce } from 'lodash';
import { ref, onChildAdded, onChildChanged, onChildRemoved, query, orderByChild, startAt, limitToLast } from 'firebase/database';

import { ChatContext } from "../../../../providers/ChatContext";
import { AuthContext } from "../../../../providers/AuthProvider";
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


  useEffect(() => {
    if (!data.chatID) {
      console.info("chatID undefined");
      return;
    }

    updateUserOnlineStatus(true, db, data.chatID, currUser.uid);


    const container = messagesContainerRef.current;

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", handleUserOffline);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUserOffline);
    }
  }, [data.chatID]);


  const handleUserOffline = () => {
    updateUserOnlineStatus(false, db, data.chatID, currUser.uid);
  };


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


  const handleScroll = () => {
    setScrolled(true);
    if (messagesContainerRef.current.scrollTop !== 0 && (atBottom.current)) {
      atBottom.current = false;
    } else if (messagesContainerRef.current.scrollTop === 0 && (!atBottom.current)) {
      atBottom.current = true;
      setUnread(0);
    }

  };


  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({ chatID: chat.id, text: chat.text, sender: chat.sender });
  }

  const handleFetchMore = debounce(async() => {
    const messageData = await fetchChats(endTimestamp.current, db, data.chatID);

    if (messageData && messageData.length > 0 && messageData[0]) {
      dispatch({type:"UPDATE_END_TIMESTAMP", payload: messageData[0].timestamp});
      dispatch({type:"ADD_OLDER_MESSAGES", payload: messageData});
    }
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
