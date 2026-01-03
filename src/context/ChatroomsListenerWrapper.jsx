import { useEffect } from "react";
import { useChatContexts } from "../hooks/useContexts";
import { ChatroomsListenerService } from "./listenerServices/ChatroomsListenerService";
import { fetchChatRoomData } from "../services/chatBarDataService";
import { updateMembersTitle } from "../utils/chatroomUtils";
import { useAudioNotifications } from "../hooks/useAudioNotifications";
import { useAuth } from "./providers/AuthContext";
import { db } from "../firebase";
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
          const { title, membersTitle, memberUids, lastMessageTimestamp } =
            await fetchChatRoomData(db, chatID);
          const updatedMembersTitle = updateMembersTitle(
            membersTitle,
            currUser.displayName,
          );

          const chatroomObj = {
            numUnread,
            title,
            updatedMembersTitle,
            memberUids,
            lastMessageTimestamp,
          };
          chatroomsDispatch({
            type: "ADD_CHATROOM",
            payload: { key: chatID, data: chatroomObj },
          });
        },
        onChatroomRemoved: (chatID) => {
          if (chatID === chatState.chatID) {
            resetAllChatContexts();
          }
          chatroomsDispatch({ type: "REMOVE_CHATROOM", payload: chatID });
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
