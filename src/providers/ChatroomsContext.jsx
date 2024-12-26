import { get, onChildAdded, onChildChanged, onChildRemoved, ref } from "firebase/database";
import { createContext, useContext, useEffect, useReducer } from "react";
import { db } from "../../firebase";
import { AuthContext } from "./AuthProvider";


export const ChatroomsContext = createContext();

const initialState = {
  chatrooms: [],
  unreadCount: [],
};

const chatroomReducer = (state, action) => {
  switch(action.type) {
    case "ADD_CHATROOM":
      return {
        ...state,
        chatrooms: [...state.chatrooms, action.payload],
      };
    case "UPDATE_CHATROOM": 
      return {
        ...state,
        chatrooms: state.chatrooms.map((chatroom) => {
          chatroom.chatID === action.payload.chatID ? {...chatroom, ...action.payload}: chatroom
        }),
      };
    case "REMOVE_CHATROOM":
      return {
        ...state,
        chatrooms: state.chatrooms.filter(chatroom => chatroom.chatID !== action.payload),
      };
    case "UPDATE_UNREAD_COUNT":
      return {
        ...state,
        unreadCount: [...state.unreadCount, action.payload],
      };
    default:
      return state;
  }
}

export const ChatroomsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatroomReducer, initialState);
  
  const { currUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currUser) return;
    const chatsInRef = ref(db, `users/${currUser.uid}/chatsIn`);

    const handleChatroomAdded = async(snap) => {
      const newChatID = snap.key;
      const newChatRef = ref(db, `chats/${newChatID}`);
      const newChatSnap = await get(newChatRef);
      const newChatData = newChatSnap.val();
      
      console.log("newChatData:" + newChatData);
      
  
  
      newChatData.chatID = newChatID;
  
      dispatch({type: "ADD_CHATROOM", payload: newChatData});
      dispatch({type: "UPDATE_UNREAD_COUNT", payload: {[newChatID]: snap.val()}});
    }
  
    const handleChatroomRemoved = (snap) => {
      dispatch({type: "REMOVE_CHATROOM", payload: snap.key });
    }
  
    const handleUpdateUnread = (snap) => {
      dispatch({type: "UPDATE_UNREAD_COUNT", payload: {[snap.key]: snap.val()}});
    }

    const chatroomAddedListener = onChildAdded(chatsInRef, handleChatroomAdded);
    const chatroomRemovedListener = onChildRemoved(chatsInRef, handleChatroomRemoved);
    const chatroomUnreadCountListener = onChildChanged(chatsInRef, handleUpdateUnread);


    return () => {
      chatroomAddedListener();
      chatroomRemovedListener();
      chatroomUnreadCountListener();
    }
  }, [currUser]);

  return (
    <ChatroomsContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatroomsContext.Provider>
  )
}