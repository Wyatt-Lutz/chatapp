import { onChildAdded, onChildChanged, onChildRemoved, ref } from "firebase/database";
import { createContext, useContext, useEffect, useReducer } from "react";
import { db } from "../../../firebase";
import { AuthContext } from "./AuthContext";
import { fetchChatRoomData } from "../../services/chatBarDataService";
import { reduceTempTitle } from "../../utils/chatroomUtils";
import { chatroomReducer } from "../reducers/ChatroomsReducer";
import { initialChatroomState } from "../initialState";


export const ChatroomsContext = createContext();



export const ChatroomsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatroomReducer, initialChatroomState);
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
