import { onChildAdded, onChildChanged, onChildRemoved, ref } from "firebase/database";
import { createContext, useContext, useEffect, useReducer } from "react";
import { db } from "../../firebase";
import { AuthContext } from "./AuthContext";
import { fetchChatRoomData, reduceTempTitle } from "../services/chatBarDataService";


export const ChatroomsContext = createContext();

const initialState = {
  chatrooms: new Map(),
};

const chatroomReducer = (state, action) => {
  let newChatrooms = new Map(state?.chatrooms);
  switch(action.type) {
    case "ADD_CHATROOM":
    case "UPDATE_CHATROOM_DATA":
      newChatrooms.set(action.payload.key, action.payload.data);
      return { chatrooms: newChatrooms };
    case "REMOVE_CHATROOM":
      newChatrooms.delete(action.payload);
      return { chatrooms: newChatrooms };
    case "UPDATE_UNREAD_COUNT":
      newChatrooms.set(action.payload.key, {...newChatrooms.get(action.payload.key), numUnread: action.payload.data});
      return { chatrooms: newChatrooms };
    case "RESET":
      return initialState;
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
      const {title, tempTitle} = await fetchChatRoomData(db, newChatID);

      const updatedTempTitle = reduceTempTitle(tempTitle, currUser.displayName);
      const chatroomObj = {numUnread: snap.val(), title, tempTitle: updatedTempTitle};
      dispatch({ type: "ADD_CHATROOM", payload: {key: newChatID, data: chatroomObj}});
    }

    const handleChatroomRemoved = (snap) => {
      dispatch({type: "REMOVE_CHATROOM", payload: snap.key });
    }

    const handleUpdateUnread = (snap) => {
      dispatch({type: "UPDATE_UNREAD_COUNT", payload: {key: snap.key, data: snap.val()}});
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
    <ChatroomsContext.Provider value={{ chatRoomsData: state, chatRoomsDispatch: dispatch }}>
      {children}
    </ChatroomsContext.Provider>
  )
}