import { useContext, useState, useEffect, useRef, memo, Fragment, useCallback } from "react";
import Plus from "../../../../styling-components/Plus";
import { AuthContext } from "../../../../providers/AuthProvider";
import { db } from "../../../../../firebase";
import { ref, query, set, get, orderByChild, equalTo, onChildAdded, update, onChildChanged, onChildRemoved, push } from 'firebase/database';
import ChatRoom from "./ChatRoom";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import ChatRoomContextMenu from "./ChatRoomContextMenu";
import ChatCreation from "./ChatCreation";
import { ChatContext } from "../../../../providers/ChatProvider";
const ChatRoomsSideBar = () => {
  const { data } = useContext(ChatContext);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { currUser } = useContext(AuthContext);
  const [chatsData, setChatsData] = useState({ 
    chats: [],
    numUnread: {},
  });
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});
  const chatsInRef = ref(db, "users/" + currUser.uid + '/chatsIn');





  const handleNewChatAdded = useCallback(async(snap) => {

    const newChatID = snap.key;
    const chatsRef = ref(db, "chats/" + newChatID);
    const newChatSnap = await get(chatsRef);
    const newChatData = newChatSnap.val();


    // If creater of chat didn't set a title, create a title for the client based off the members usernames
    if (newChatData.title === "") {
      const membersRef = ref(db, "members/" + newChatID);
      const membersSnap = await get(membersRef);
      const membersData = Object.values(membersSnap.val()) || {};
      newChatData.title = membersData.filter(member => member.username !== currUser.displayName).map(member => member.username).join(', ');
    }



    newChatData.id = newChatID;
    setChatsData(prev => ({
      chats: [...prev.chats, newChatData],
      numUnread: {
        ...prev.numUnread,
        [newChatID]: snap.val(),
      }
    }));
    setIsLoadingChats(false);

  });

  const handleUpdateUnread = (snap) => {
    setChatsData(prev => ({
      numUnread: {
        ...prev.numUnread,
        [snap.key]: snap.val(),
      }
    }));
  };


  const handleChildRemoved = (snap) => {
    setChatsData(prev => prev.chats.filter(chat => chat.id !== snap.key));
  };


  useEffect(() => {
    //set loading chats to false after 1.5 seconds as a fallback in case there is no data
    const isLoadingFallbackTimer = setTimeout(() => {
      setIsLoadingChats(false);
    }, 1500);


    const childAddedListener = onChildAdded(chatsInRef, handleNewChatAdded);
    const childChangedListener = onChildChanged(chatsInRef, handleUpdateUnread);
    const childRemovedListener = onChildRemoved(chatsInRef, handleChildRemoved);



    return () => {
      clearTimeout(isLoadingFallbackTimer);
      childAddedListener();
      childChangedListener();
      childRemovedListener();
    }
  }, [currUser]);


  const changeChatRoomCreationState = (state) => {
    setIsCreatingChat(state);
  };

  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    console.log(chat);
    setContextMenuData({ chatID: chat.id });
  }


  return(
    <section>

      <button className="m-2 ring"onClick={() => setIsCreatingChat(true)}><Plus /></button>
      {isCreatingChat && (
        <ChatCreation changeChatRoomCreationState={changeChatRoomCreationState} />
      )}

      <div className="flex flex-col">
        {isLoadingChats ? (
          <div>Loading chats...</div>
        ) : chatsData?.chats?.length > 0 ? (
          chatsData.chats.map((chat) => (

            <div key={chat.id} onContextMenu={(e) => handleContextMenu(e, chat)}>
              <ChatRoom chat={chat} numUnread={chatsData.numUnread[chat.id]}/>
            </div>
          ))

        ) : (
            <div>You aren't in any chats</div>
        )}
      </div>

      {clicked && (
        <ChatRoomContextMenu contextMenuData={contextMenuData} points={points}/>
      )}



    </section>

  )
}
export default memo(ChatRoomsSideBar);