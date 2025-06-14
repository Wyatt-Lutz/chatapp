import { createContext, useEffect, useReducer } from "react";
import { db } from "../../../firebase";
import { fetchChatRoomData } from "../../services/chatBarDataService";
import { updateTempTitle } from "../../utils/chatroomUtils";
import { chatroomReducer } from "../reducers/chatroomsReducer";
import { initialChatroomState } from "../initialState";
import { useAuth } from "./AuthContext";
import { ChatroomsListenerService } from "../listenerServices/ChatroomsListenerService";

export const ChatroomsContext = createContext();

export const ChatroomsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatroomReducer, initialChatroomState);
  const { currUser } = useAuth();
  const notificationSound = new Audio("/notification.mp3");

  useEffect(() => {
    if (!currUser) return;

    const unsubscribe = ChatroomsListenerService.setUpChatroomsListeners(
      currUser.uid,
      {
        onChatroomAdded: async (newChatID, numUnread) => {
          const chatRoomData = await fetchChatRoomData(db, newChatID);
          if (!chatRoomData) {
            console.error("yes");
            return;
          }
          const { title, tempTitle, memberUids } = await fetchChatRoomData(
            db,
            newChatID,
          );

          const updatedTempTitle = updateTempTitle(
            tempTitle,
            currUser.displayName,
          );
          const chatroomObj = {
            numUnread: numUnread,
            title,
            tempTitle: updatedTempTitle,
            memberUids: memberUids,
          };
          dispatch({
            type: "ADD_CHATROOM",
            payload: { key: newChatID, data: chatroomObj },
          });
        },
        onChatroomRemoved: (chatID) => {
          dispatch({ type: "REMOVE_CHATROOM", payload: chatID });
        },
        onUpdateUnread: (chatID, newUnreadCount) => {
          notificationSound.play();

          dispatch({
            type: "UPDATE_UNREAD_COUNT",
            payload: { key: chatID, data: newUnreadCount },
          });
        },
      },
    );

    return unsubscribe;
  }, [currUser]);

  return (
    <ChatroomsContext.Provider
      value={{ chatroomsState: state, chatroomsDispatch: dispatch }}
    >
      {children}
    </ChatroomsContext.Provider>
  );
};
