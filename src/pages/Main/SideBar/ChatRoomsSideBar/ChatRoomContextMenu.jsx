import { removeUserFromChat } from "../../../../services/memberDataService";
import { db } from "../../../../../firebase";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useChatContexts } from "../../../../hooks/useContexts";
const ChatRoomContextMenu = ({contextMenuData, points}) => {
  const { currUser } = useAuth();
  const { chatState, chatDispatch, resetAllChatContexts} = useChatContexts();

  const onLeaveGroupChat = async() => {
    await removeUserFromChat(db, contextMenuData.chatID, currUser.uid, currUser.displayName, currUser.uid, chatState.numOfMembers, chatDispatch, resetAllChatContexts);
  }

  return (
    <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points.y, left: points.x}}>
      <button onClick={onLeaveGroupChat}>Leave Group Chat</button>
    </div>
  )
}
export default ChatRoomContextMenu;
