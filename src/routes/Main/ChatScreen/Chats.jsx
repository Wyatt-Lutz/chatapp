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
import ContextMenu from "./ContextMenu";
import TopBar from "./TopBar";
import { useContextMenu } from "./MembersBar/useContextMenu";

const Chats = () => {

  const { data } = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);
  const [chats, setChats] = useState([])
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [editState, setEditState] = useState({});
  const [contextMenuData, setContextMenuData] = useState(null);
  const chatsRef = useMemo(() =>  ref(db, "messages/" + data.chatID + "/"));
  const endTimestamp = useRef(0);
  const [unread, setUnread] = useState(0);

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

    if (!atBottom) {
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

  /*
  const handleMemberAdded = useCallback((snap) => {
    console.log('handleMemberAdded')
    const existingData = queryClient.getQueryData(['members', data.chatID]) ?? [];
    queryClient.setQueryData(['members', data.chatID], [...existingData, snap.key]);
  }, [data.chatID]);

  const handleMemberChanged = useCallback((snap) => {
    console.log('handleMemberChanged')
    const existingData = queryClient.getQueryData(['members', data.chatID]) ?? [];
    console.log(snap.val());
    console.log(snap.key);
  }, [data.chatID])

  const handleMemberRemoved = useCallback((snap) => {
    console.log('handleMemberRemoved')
    const existingData = queryClient.getQueryData(['members', data.chatID]) ?? [];
    const updatedData = existingData.filter((member) => member.key !== snap.key);
    queryClient.setQueryData(['members', data.chatID], updatedData);
  }, [data.chatID])
*/


  useEffect(() => {
    if (!data.chatID) {
      console.info("chatID undefined");
      return;
    }
    updateUserOnlineStatus(true, db, data.chatID, currUser.displayName, currUser.uid);

    const addedListenerQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp.current), limitToLast(10));
    const otherListenersQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp.current));
/*
    const membersRef  = ref(db, "members/" + data.chatID);
    const memberAddedListener = onChildAdded(membersRef, handleMemberAdded);
    const memberChangedListener = onChildChanged(membersRef, handleMemberChanged);
    const memberRemovedListener = onChildRemoved(membersRef, handleMemberRemoved);
*/

    const childAddedListener = onChildAdded(addedListenerQuery, handleChildAdded);
    const childChangedListener = onChildChanged(otherListenersQuery, handleChildChanged);
    const childRemovedListener = onChildRemoved(otherListenersQuery, handleChildRemoved);


    const container = messagesContainerRef.current;

    window.addEventListener("click", handleClick);
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", handleUserOffline);
    return () => {
      childAddedListener();
      childChangedListener();
      childRemovedListener();
      /*
      memberAddedListener();
      memberChangedListener();
      memberRemovedListener();
      */
      window.removeEventListener("click", handleClick);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUserOffline);
      handleUserOffline();
    }
  }, [data.chatID]);


  const handleUserOffline = useCallback(() => {
    updateUserOnlineStatus(false, db, data.chatID, currUser.uid);
  }, [data.chatID]);


  const calculateRenderTimeAndSender = useCallback(() => {
    const prevTimestamp = localStorage.getItem('timestamp');
    let renderTimeAndSender = true;
    setChats(prev => {
      const previousMessage = prev[prev.length -1];

      if (prevTimestamp && previousMessage.sender === currUser.displayName && Date.now() - prevTimestamp < 180000) {
        renderTimeAndSender = false;
      }
      return prev;
    })

    return renderTimeAndSender;
  }, []);

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
    if(lastMessageRef.current && atBottom) {
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
                  <Fragment key={chat.id}>

                    <div onContextMenu={(e) => handleContextMenu(e, chat)} className="hover:bg-gray-600">
                      <Chat chat={chat} index={index} isEditing={editState[chat.id]} changeEditState={changeEditState}/>
                    </div>

                    {index === chats.length - 1 && (
                      <div ref = {lastMessageRef} />
                    )}

                  </Fragment>



                ))}
              </div>



            <Input calculateRenderTimeAndSender={calculateRenderTimeAndSender} />
        </div>

        <div className="flex border min-h-10" ref={containerRef}></div>
      </div>
      {(clicked && contextMenuData.sender === currUser.displayName) && (
        <ContextMenu changeEditState={changeEditState} contextMenuData={contextMenuData} points={points} />
      )}
      {unread > 0 && (
        <div>{unread} new messages</div>
      )}




    </section>
  )
}

export default Chats;
