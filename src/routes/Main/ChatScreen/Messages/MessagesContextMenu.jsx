import { useContext, memo } from "react";
import { db } from "../../../../../firebase";
import { ChatContext } from "../../../../providers/ChatContext";
import { deleteMessage } from "../../../../services/messageDataService";
const MessagesContextMenu = ({changeEditState, contextMenuData: {messageUid}, points}) => {
  const { currChat } = useContext(ChatContext);
  return (
    <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points.y, left: points.x}}>
      <button onClick={() => changeEditState(messageUid, true)}>Edit</button>
      <button onClick={() => deleteMessage(messageUid, db, currChat.chatData.chatID)}>Delete</button>
    </div>
  )
}
export default MessagesContextMenu;