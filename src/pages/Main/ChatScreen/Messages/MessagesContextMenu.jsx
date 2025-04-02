import { db } from "../../../../../firebase";
import { deleteMessage } from "../../../../services/messageDataService";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useChatContexts } from "../../../../hooks/useContexts";
const MessagesContextMenu = ({changeEditState, contextMenuData: {sender, messageUid}, points}) => {
  const { chatState, messageDispatch } = useChatContexts();
  const { currUser } = useAuth();

  const handleDeleteMessage = async () => {
    messageDispatch({ type: "REMOVE_MESSAGE", payload: messageUid });

    await deleteMessage(db, chatState.chatID, messageUid);
  }


  return (
    <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points.y, left: points.x}}>
      {sender === currUser.uid && (
        <button onClick={() => changeEditState(messageUid, true)}>Edit</button>
      )}
      <button onClick={handleDeleteMessage}>Delete</button>
    </div>
  )
}
export default MessagesContextMenu;
