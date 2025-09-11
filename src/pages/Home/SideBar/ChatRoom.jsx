import { fetchChatRoomData } from "../../../services/chatBarDataService";
import { db } from "../../../firebase";
import { useAuth } from "../../../context/providers/AuthContext";
import { useChatContexts } from "../../../hooks/useContexts";
import { updateMembersTitle } from "../../../utils/chatroomUtils";

const ChatRoom = ({ chatID, chatroomData }) => {
  const { chatroomsDispatch, chatState, chatDispatch, resetAllChatContexts } =
    useChatContexts();
  const { currUser } = useAuth();
  const handleChangeChat = async () => {
    resetAllChatContexts();

    const { firstMessageID, owner, title, membersTitle, numOfMembers } =
      await fetchChatRoomData(db, chatID);
    if (title !== chatroomData.title) {
      chatroomsDispatch({
        type: "UPDATE_TITLE",
        payload: { key: chatID, data: { title: title } },
      });
    }

    const updatedMembersTitle = updateMembersTitle(
      membersTitle,
      currUser.displayName,
    );
    if (updatedMembersTitle !== chatroomData.membersTitle) {
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
        title: chatroomData.title,
        numOfMembers,
        memberUids: chatroomData.memberUids,
      },
    });
  };

  return (
    <div className="flex">
      <button
        disabled={chatState.chatID === chatID}
        className="ring m-2"
        onClick={handleChangeChat}
      >
        {chatState.chatID === chatID ? (
          <>{chatState.title || chatState.membersTitle}</>
        ) : (
          <>{chatroomData.title || chatroomData.membersTitle}</>
        )}
      </button>
      <div>{chatroomData.numUnread}</div>
    </div>
  );
};

export default ChatRoom;
