import { useState, useEffect, useRef } from "react";
import { db } from "../../../../../firebase";
import { debounce } from 'lodash';
import { useElementOnScreen } from "../../../../hooks/useIntersectionObserver";
import { fetchOlderChats, updateUserOnlineStatus } from "../../../../services/messageDataService";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import Message from "./Message"
import Input from "./Input";
import MessagesContextMenu from "./MessagesContextMenu";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";


const Messages = () => {
  const { chatState, memberState, messageState, messageDispatch } = useChatContexts();
  const { currUser } = useAuth();

  const {chatID, title, tempTitle} = chatState;
  const { numUnread, isAtBottom, endTimestamp, messages, isFirstMessageRendered } = messageState;
  const { contextMenu, setContextMenu, points, setPoints } = useContextMenu();

  const [scrolled, setScrolled] = useState(false);
  const [editState, setEditState] = useState({});


  const [messageContextMenuData, setMessageContextMenuData] = useState({});


  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);


  //Intersection Observer configurations
  const [containerRef, isVisible] = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 1,
  });


  useEffect(() => {
    const handleUpdateUserOnlineStatus = async() => {
      await updateUserOnlineStatus(true, db, chatID, currUser.uid);
    }

    if (!chatID) {
      console.info("chatID undefined");
      return;
    }

    handleUpdateUserOnlineStatus();

    const handleUserOffline = () => {
      updateUserOnlineStatus(false, db, chatID, currUser.uid);
    };

    const handleScroll = () => {
      const scrollTop = messagesContainerRef.current.scrollTop;
      setScrolled(true);

      if (scrollTop !== 0 && (isAtBottom)) {
        messageDispatch({type: "UPDATE_AT_BOTTOM", payload: false});
      } else if (scrollTop === 0 && (!isAtBottom)) {
        messageDispatch({type: "UPDATE_AT_BOTTOM", payload: true});
        messageDispatch({type: "UPDATE_UNREAD", payload: 0});
      }

    };

    const container = messagesContainerRef.current;

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", handleUserOffline);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUserOffline);
    }
  }, [chatID, currUser.uid, messageDispatch, isAtBottom, isFirstMessageRendered]);



  useEffect(() => {


    const handleFetchMore = debounce(async() => {
      const messageData = await fetchOlderChats(endTimestamp, db, chatID);
      const keysOfMessages = Object.keys(messageData);
      if (messageData && keysOfMessages.length > 0) {
        const timestampOfOldestMessage = messageData[keysOfMessages[0].timestamp];
        messageDispatch({type:"UPDATE_END_TIMESTAMP", payload: timestampOfOldestMessage});

        const newMessageMap = new Map(Object.entries(messageData));
        messageDispatch({type: "ADD_OLDER_MESSAGES", payload: newMessageMap});
      }
    }, 300);


    if (!isFirstMessageRendered && isVisible && scrolled) {
      handleFetchMore();
    }
  }, [isVisible, scrolled, messageDispatch, chatID, endTimestamp, isFirstMessageRendered]);


  useEffect(() => {
    if(lastMessageRef.current && isAtBottom) {
      lastMessageRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [isAtBottom]);




  const changeEditState = (id, state) => {
    console.info('i ran');
    setEditState(prev => ({...prev, [id]: state}));
  };


  const handleMessageContextMenu = (e, messageUid, messageData) => {
    e.preventDefault();
    setContextMenu(prev => ({...prev, 'messages': true}));
    setPoints(prev => ({...prev, 'messages': {x: e.pageX, y: e.pageY}}));
    setMessageContextMenuData({ messageUid, text: messageData.text, sender: messageData.sender });
  }




  return(
    <section className="w-full">

      <div ref={messagesContainerRef} className="overflow-y-auto max-h-[800px] no-scrollbar w-full flex flex-col-reverse scroll-smooth">
          <div className="flex-grow">

              <div>
                {!messages ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    {(isFirstMessageRendered || chatState.firstMessageID === "") && (
                      <div>This is the start of {title || tempTitle}</div>
                    )}
                    {[...messages].map(([messageUid, messageData], index) => {
                      const memberDataOfSender = memberState.members.get(messageData.sender);
                      return (
                        <div key={messageUid} onContextMenu={(e) => handleMessageContextMenu(e, messageUid, messageData)}>
                          <Message messageUid={messageUid} memberDataOfSender={memberDataOfSender} messageData={messageData} isEditing={editState[messageUid]} changeEditState={changeEditState}/>


                          {index === messageData.size - 1 && (
                            <div ref = {lastMessageRef} />
                          )}

                        </div>

                      )
                    })}
                  </>
                )}


              </div>

            <Input />
        </div>

        <div className="flex border" ref={containerRef}></div>
      </div>

      {numUnread > 0 && (
        <div>{numUnread} new messages</div>
      )}
      {(contextMenu.messages && messageContextMenuData.sender !== 'server' && (messageContextMenuData.sender === currUser.uid || currUser.uid === chatState.owner)) && (
        <MessagesContextMenu changeEditState={changeEditState} contextMenuData={messageContextMenuData} points={points.messages} />
      )}





    </section>
  )
}

export default Messages;
