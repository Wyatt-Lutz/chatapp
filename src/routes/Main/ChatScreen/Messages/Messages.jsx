import { useContext, useState, memo, useEffect, useRef } from "react";
import { db } from "../../../../../firebase";
import { debounce } from 'lodash';
import { ChatContext } from "../../../../providers/ChatContext";
import { AuthContext } from "../../../../providers/AuthProvider";
import { useElementOnScreen } from "../../../../hooks/useIntersectionObserver";
import { fetchChats, updateUserOnlineStatus } from "../../../../services/messageDataService";
import Message from "./Message"
import Input from "./Input";


const Messages = () => {
  console.log('messagessss run');
  const { chatState, messageState, messageDispatch } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);
  const chatID = chatState.chatID;
  const numUnread = messageState.numUnread;
  const isAtBottom = messageState.isAtBottom;
  const endTimestamp = messageState.endTimestamp;
  const messages = messageState.messages

  const [scrolled, setScrolled] = useState(false);
  const [editState, setEditState] = useState({});



  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);


  //Intersection Observer configurations
  const [containerRef, isVisible] = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 1,
  });


  useEffect(() => {
    if (!chatID) {
      console.info("chatID undefined");
      return;
    }

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

    updateUserOnlineStatus(true, db, chatID, currUser.uid);


    const container = messagesContainerRef.current;

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", handleUserOffline);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUserOffline);
    }
  }, [chatID, currUser.uid, messageDispatch, isAtBottom]);



  useEffect(() => {


    const handleFetchMore = debounce(async() => {
      const messageData = await fetchChats(endTimestamp, db, chatID);

      if (messageData && messageData.size > 0) {
        messageDispatch({type:"UPDATE_END_TIMESTAMP", payload: messageData[0].timestamp});
        messageDispatch({type:"ADD_OLDER_MESSAGES", payload: messageData});
      }
    }, 300);


    if (isVisible && scrolled) {
      handleFetchMore();
    }
  }, [isVisible, scrolled, messageDispatch, chatID, endTimestamp]);


  useEffect(() => {
    if(lastMessageRef.current && isAtBottom) {
      lastMessageRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [isAtBottom]);




  const changeEditState = (id, state) => {
    console.info('i ran');
    setEditState(prev => ({...prev, [id]: state}));
  };


  return(
    <section className="w-full">

      <div ref={messagesContainerRef} className="overflow-y-auto max-h-[400px] no-scrollbar w-full flex flex-col-reverse scroll-smooth">
          <div className="flex-grow">

              <div>
                {!messages ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    {[...messages].map(([messageUid, messageData], index) => {
                      return (
                        <div key={messageUid}>
                          <Message messageUid={messageUid} messageData={messageData} isFirst={index === 0} isEditing={editState[messageUid]} changeEditState={changeEditState}/>



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

        <div className="flex border min-h-10" ref={containerRef}></div>
      </div>

      {numUnread > 0 && (
        <div>{numUnread} new messages</div>
      )}




    </section>
  )
}

export default Messages;
