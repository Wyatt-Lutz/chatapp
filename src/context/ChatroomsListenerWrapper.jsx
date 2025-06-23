import { useEffect } from "react";
import { useChatContexts } from "../hooks/useContexts";
import { ChatroomsListenerService } from "./listenerServices/ChatroomsListenerService";
import { fetchChatRoomData } from "../services/chatBarDataService";
import { updateTempTitle } from "../utils/chatroomUtils";
import { useAudioNotifications } from "../hooks/useAudioNotifications";
import { useAuth } from "./providers/AuthContext";
import { db } from "../../firebase";
const ChatroomsListenerWrapper = ({ children }) => {
  const { currUser } = useAuth();
  const { chatState, chatroomsDispatch, resetAllChatContexts } =
    useChatContexts();
  const { playNotification } = useAudioNotifications();
  useEffect(() => {
    if (!currUser) return;

    const unsubscribe = ChatroomsListenerService.setUpChatroomsListeners(
      currUser.uid,
      {
        onChatroomAdded: async (chatID, numUnread) => {
          const { title, tempTitle, memberUids, lastMessageTimestamp } =
            await fetchChatRoomData(db, chatID);
          const updatedTempTitle = updateTempTitle(
            tempTitle,
            currUser.displayName,
          );

          const chatroomObj = {
            numUnread: numUnread,
            title,
            tempTitle: updatedTempTitle,
            memberUids: memberUids,
            lastMessageTimestamp: lastMessageTimestamp,
          };
          chatroomsDispatch({
            type: "ADD_CHATROOM",
            payload: { key: chatID, data: chatroomObj },
          });
        },
        onChatroomRemoved: (chatID) => {
          chatroomsDispatch({ type: "REMOVE_CHATROOM", payload: chatID });

          if (chatID === chatState.chatID) {
            resetAllChatContexts();
          }
        },
        onUpdateUnread: (chatID, newUnreadCount) => {
          chatroomsDispatch({
            type: "UPDATE_UNREAD_COUNT",
            payload: { key: chatID, data: newUnreadCount },
          });
          playNotification();
        },
      },
    );

    return unsubscribe;
  }, [currUser?.uid, chatState.chatID]);

  return children;
};
export default ChatroomsListenerWrapper;
