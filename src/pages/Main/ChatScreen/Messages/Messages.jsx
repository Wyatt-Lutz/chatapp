import { useState, useEffect, useRef } from "react";
import { db } from "../../../../../firebase";
import { debounce } from 'lodash';
import { useElementOnScreen } from "../../../../hooks/useIntersectionObserver";
import { fetchOlderChats, updateUserOnlineStatus } from "../../../../services/messageDataService";
import Message from "./Message"
import Input from "./Input";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import MessagesContextMenu from "./MessagesContextMenu";
import MemberContextMenu from "../MembersBar/MemberContextMenu";


const Messages = () => {
  const { chatState, memberState, messageState, messageDispatch } = useChatContexts();
  const { currUser } = useAuth();

  const {chatID, title, tempTitle} = chatState;
  const { numUnread, isAtBottom, endTimestamp, messages, isFirstMessageRendered } = messageState;

  const [scrolled, setScrolled] = useState(false);
  const [editState, setEditState] = useState({});

  const [memberContextMenuData, setMemberContextMenuData] = useState({});
  const [messageContextMenuData, setMessageContextMenuData] = useState({});
  const { contextMenu, setContextMenu, points, setPoints } = useContextMenu();


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
      console.log('handle fetch more run')
      console.log(endTimestamp);
      console.log(isFirstMessageRendered);
      const messageData = await fetchOlderChats(db, chatID, endTimestamp);
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
    setEditState(prev => ({...prev, [id]: state}));
  };



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
                        <div key={messageUid}>
                          <Message
                            messageUid={messageUid}
                            memberDataOfSender={memberDataOfSender}
                            messageData={messageData}
                            isEditing={editState[messageUid]}
                            changeEditState={changeEditState}
                            index={index}
                            onMemberContextMenu={(e, memberUid, memberData) => {
                              e.preventDefault();
                              setContextMenu({member: true});
                              setPoints({member: {x: e.pageX, y: e.pageY}});
                              setMemberContextMenuData({memberUid, memberData});
                            }}
                            onMessageContextMenu={(e, messageUid, messageData) => {
                              e.preventDefault();
                              setContextMenu({messages: true});
                              setPoints({ messages: {x: e.pageX, y: e.pageY}});
                              setMessageContextMenuData({ messageUid, messageData });
                            }}


                            />


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

      {(contextMenu.member && memberContextMenuData.memberUid !== currUser.uid) && (
        <MemberContextMenu contextMenuData={memberContextMenuData} points={points.member} />
      )}

      {(contextMenu.messages && messageContextMenuData.messageData.sender !== 'server' && (messageContextMenuData.messageData.sender === currUser.uid || currUser.uid === chatState.owner)) && (
        <MessagesContextMenu changeEditState={changeEditState} contextMenuData={messageContextMenuData} points={points.messages}/>
      )}






    </section>
  )
}

export default Messages;
