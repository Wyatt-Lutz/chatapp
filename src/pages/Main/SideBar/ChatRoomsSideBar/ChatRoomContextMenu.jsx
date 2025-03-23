import { useContext } from "react"
import { deleteChatRoom, removeUserFromChat } from "../../../../services/memberDataService";
import { db } from "../../../../../firebase";
import { AuthContext } from "../../../../context/providers/AuthContext";
import { ChatContext } from "../../../../context/providers/ChatContext";
const ChatRoomContextMenu = ({contextMenuData, points}) => {
  const { currUser } = useContext(AuthContext);
  const { chatState, memberDispatch, chatDispatch, messageDispatch} = useContext(ChatContext);

  const onLeaveGroupChat = async() => {
    await removeUserFromChat(db, contextMenuData.chatID, currUser.uid, currUser.displayName, currUser.uid, chatState.numOfMembers, chatDispatch, memberDispatch, messageDispatch);
  }

  return (
    <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points.y, left: points.x}}>
      <button onClick={onLeaveGroupChat}>Leave Group Chat</button>
    </div>
  )
}
export default ChatRoomContextMenu;
