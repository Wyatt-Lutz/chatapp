import { fetchChatRoomData } from "../../../services/chatBarDataService";
import { db } from "../../../firebase";
import { useAuth } from "../../../context/providers/AuthContext";
import { useChatContexts } from "../../../hooks/useContexts";
import { updateMembersTitle } from "../../../utils/chatroomUtils";
import ChatRoomItem from "../../../components/Sidebar/ChatRoomItem";

const ChatRoom = ({
  chatID,
  chatroomData,
  onContextMenu,
  setIsSidebarCollapsed,
}) => {
  const { chatroomsDispatch, chatState, chatDispatch, resetAllChatContexts } =
    useChatContexts();
  const { currUser } = useAuth();

  const handleChangeChat = async () => {
    if (chatState.chatID === chatID) return;

    resetAllChatContexts();

    const { firstMessageID, owner, title, membersTitle, numOfMembers } =
      await fetchChatRoomData(db, chatID);
    if (title !== chatroomData.title) {
      chatroomsDispatch({
        type: "UPDATE_TITLE",
        payload: { key: chatID, data: title },
      });
    }

    const updatedMembersTitle = updateMembersTitle(
      membersTitle,
      currUser.displayName,
    );
    if (updatedMembersTitle !== chatroomData.updatedMembersTitle) {
      chatroomsDispatch({
        type: "UPDATE_TEMP_TITLE",
        payload: { key: chatID, data: updatedMembersTitle },
      });
    }

    chatDispatch({
      type: "CHANGE_CHAT",
      payload: {
        chatID,
        firstMessageID,
        owner,
        membersTitle: updatedMembersTitle,
        title: title,
        numOfMembers,
        memberUids: chatroomData.memberUids,
      },
    });

    if (setIsSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }
  };

  const title = chatroomData.title || chatroomData.updatedMembersTitle;

  return (
    <ChatRoomItem
      onContextMenu={(e) => onContextMenu && onContextMenu(e, chatID)}
      title={
        chatState.chatID === chatID
          ? chatState.title || chatState.membersTitle
          : title
      }
      unread={chatroomData.numUnread || 0}
      active={chatState.chatID === chatID}
      onClick={handleChangeChat}
    />
  );
};

export default ChatRoom;
