import { useContext, memo } from "react";
import { db } from "../../../../../firebase";
import { ChatContext } from "../../../../providers/ChatContext";
import { deleteMessage } from "../../../../services/messageDataService";
const MessagesContextMenu = ({changeEditState, contextMenuData, points}) => {
  const { chatRoomData } = useContext(ChatContext);
  console.log('contextmenu run');
  return (
    <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points?.y, left: points?.x}}>
      <button onClick={() => changeEditState(contextMenuData.chatID, true)}>Edit</button>
      <button onClick={() => deleteMessage(contextMenuData.chatID, db, chatRoomData.chatID)}>Delete</button>
    </div>
  )
}
export default memo(MessagesContextMenu);