import { useContext, useState, useMemo, useCallback, useEffect, useRef, Fragment} from "react";
import { ChatContext } from "../../../ChatProvider";
import { AuthContext } from "../../../AuthProvider";
import { db } from "../../../../firebase";
import { debounce } from 'lodash';
import { useElementOnScreen } from "../../../IntersectionObserver";
import { ref, onChildAdded, onChildChanged, onChildRemoved, query, orderByChild, startAt, limitToLast, update } from 'firebase/database'
import {fetchChats, updateUserOnlineStatus} from './useChatData';
import Chat from "./Chat";
import Input from "./Input";
import ChatContextMenu from "./ChatContextMenu";
import TopBar from "./TopBar";
import { useContextMenu } from "./useContextMenu";

const Chats = () => {

  const { data } = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);

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
    setChats(prev => {
      const updatedChats = [...prev, snap.val()];
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


    const childAddedListener = onChildAdded(addedListenerQuery, handleChildAdded);
    const childChangedListener = onChildChanged(otherListenersQuery, handleChildChanged);
    const childRemovedListener = onChildRemoved(otherListenersQuery, handleChildRemoved);


    const container = messagesContainerRef.current;

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", handleUserOffline);
    return () => {
      childAddedListener();
      childChangedListener();
      childRemovedListener();

      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUserOffline);
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
      console.log(previousMessage);

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
    console.log(atBottom);

  }, []);


  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({ chatID: chat.id, text: chat.text, sender: chat.sender });
    console.log('right cliecked');
  }

  const handleFetchMore = debounce(async() => {
    const messageData = await fetchChats(endTimestamp.current, db, data.chatID);
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
    setEditState((prev) => ({...prev, [id]: state}));
  }, [data.chatID]);


  return(
    <section className="w-full">

      <TopBar />


      <div ref={messagesContainerRef} className="overflow-y-auto max-h-[400px] no-scrollbar w-full flex flex-col-reverse scroll-smooth">
          <div className="flex-grow">

              <div>

                {chats?.map((chat, index) => (
                  <div key={chat.id}>

                    <div onContextMenu={(e) => handleContextMenu(e, chat)} className="hover:bg-gray-600">
                      <Chat chat={chat} isFirst={index === 0} isEditing={editState[chat.id]} changeEditState={changeEditState}/>
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
        <ChatContextMenu changeEditState={changeEditState} contextMenuData={contextMenuData} points={points} />
      )}
      {unread > 0 && (
        <div>{unread} new messages</div>
      )}




    </section>
  )
}

export default Chats;
