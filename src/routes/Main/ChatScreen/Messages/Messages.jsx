import { useContext, useState, memo, useEffect, useRef } from "react";
import { db } from "../../../../../firebase";
import { debounce } from 'lodash';
import { ChatContext } from "../../../../providers/ChatContext";
import { AuthContext } from "../../../../providers/AuthProvider";
import { useElementOnScreen } from "../../../../hooks/useIntersectionObserver";
import { calculateRenderTimeAndSender, fetchChats, updateUserOnlineStatus } from "../../../../services/messageDataService";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import { MessagesContext } from "../../../../providers/MessagesContext";
import Message from "./Message"
import Input from "./Input";
import MessagesContextMenu from "./MessagesContextMenu";

const Messages = () => {
  const { chatRoomData } = useContext(ChatContext);
  const { messageData } = useContext(MessagesContext);
  const { currUser } = useContext(AuthContext);
  const { dispatch } = useContext(MessagesContext);

  const [scrolled, setScrolled] = useState(false);
  const [editState, setEditState] = useState({});
  const [contextMenuData, setContextMenuData] = useState({});


  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  const { clicked, setClicked, points, setPoints } = useContextMenu();


  const [containerRef, isVisible] = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 1,
  });


  useEffect(() => {
    if (!chatRoomData.chatID) {
      console.info("chatID undefined");
      return;
    }

    const handleUserOffline = () => {
      updateUserOnlineStatus(false, db, chatRoomData.chatID, currUser.uid);
    };

    const handleScroll = () => {
      const atBottom = messageData.atBottom
      const scrollTop = messagesContainerRef.current.scrollTop;
      setScrolled(true);
  
      if (scrollTop !== 0 && (atBottom)) {
        dispatch({type: "UPDATE_AT_BOTTOM", payload: false});
      } else if (scrollTop === 0 && (!atBottom)) {
        dispatch({type: "UPDATE_AT_BOTTOM", payload: true});
        dispatch({type: "UPDATE_UNREAD", payload: 0});
      }
  
    };

    updateUserOnlineStatus(true, db, chatRoomData.chatID, currUser.uid);


    const container = messagesContainerRef.current;

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", handleUserOffline);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUserOffline);
    }
  }, [chatRoomData.chatID, currUser.uid, dispatch, messageData.atBottom]);








  const handleContextMenu = (e, id, text, sender) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({ id, text, sender });
  }





  useEffect(() => {
    if (isVisible && scrolled) {
      handleFetchMore();
    }

    const handleFetchMore = debounce(async() => {
      const messageData = await fetchChats(messageData.endTimestamp, db, chatRoomData.chatID);
  
      if (messageData && messageData.length > 0 && messageData[0]) {
        dispatch({type:"UPDATE_END_TIMESTAMP", payload: messageData[0].timestamp});
        dispatch({type:"ADD_OLDER_MESSAGES", payload: messageData});
      }
    }, 300);
  }, [isVisible, scrolled, dispatch, chatRoomData.chatID]);


  useEffect(() => {
    if(lastMessageRef.current && messageData.atBottom) {
      lastMessageRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [messageData.atBottom]);




  const changeEditState = (id, state) => {
    console.info('i ran');
    setEditState(prev => ({...prev, [id]: state}));
  };


  return(
    <section className="w-full">

      <div ref={messagesContainerRef} className="overflow-y-auto max-h-[400px] no-scrollbar w-full flex flex-col-reverse scroll-smooth">
          <div className="flex-grow">

              <div>

                {messageData?.messages.map((chat, index) => {
                  const {id, message} = chat;
                  return (
                    <div key={id}>

                    <div onContextMenu={(e) => handleContextMenu(e, id, message.text, message.sender)} className="hover:bg-gray-600">
                      <Message chat={chat} isFirst={index === 0} isEditing={editState[id]} changeEditState={changeEditState}/>
                    </div>

                    {index === messageData.length - 1 && (
                      <div ref = {lastMessageRef} />
                    )}

                  </div>
                  )
                })}
              </div>

            <Input calculateRenderTimeAndSender={calculateRenderTimeAndSender} />
        </div>

        <div className="flex border min-h-10" ref={containerRef}></div>
      </div>
      {(clicked && contextMenuData.sender === currUser.displayName) && (
        <MessagesContextMenu changeEditState={changeEditState} contextMenuData={contextMenuData} points={points} />
      )}
      {messageData.numUnread > 0 && (
        <div>{messageData.numUnread} new messages</div>
      )}




    </section>
  )
}

export default memo(Messages);
