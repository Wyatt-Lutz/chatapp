import { useContext } from "react";
import { db } from "../../../../../firebase";
import { ChatContext } from "../../../../context/ChatContext";
import { deleteMessage } from "../../../../services/messageDataService";
import { AuthContext } from "../../../../context/AuthContext";
const MessagesContextMenu = ({changeEditState, contextMenuData: {sender, messageUid}, points}) => {
  console.log('messagesContextMenu run');
  const { chatState } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);
  return (
    <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points.y, left: points.x}}>
      {sender === currUser.uid && (
        <button onClick={() => changeEditState(messageUid, true)}>Edit</button>
      )}
      <button onClick={() => deleteMessage(messageUid, db, chatState.chatID)}>Delete</button>
    </div>
  )
}
export default MessagesContextMenu;