import { db, storage } from "../../../../../firebase";
import { deleteMessage } from "../../../../services/messageDataService";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useChatContexts } from "../../../../hooks/useContexts";
import { deleteObject, ref } from "firebase/storage";
const MessagesContextMenu = ({
  changeEditState,
  contextMenuData: { messageUid, messageData },
  points,
}) => {
  const { chatState, messageDispatch } = useChatContexts();
  const { currUser } = useAuth();

  const handleDeleteMessage = async () => {
    messageDispatch({ type: "REMOVE_MESSAGE", payload: messageUid });

    await deleteMessage(db, chatState.chatID, messageUid);
    if (messageData.imageRef) {
      const imageLocation = ref(
        storage,
        `chats/${chatState.chatID}/${messageUid}`,
      );
      await deleteObject(imageLocation);
    }
  };

  return (
    <div
      className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col"
      style={{ top: points.y, left: points.x }}
    >
      {messageData.sender === currUser.uid && (
        <button onClick={() => changeEditState(messageUid, true)}>Edit</button>
      )}
      <button onClick={handleDeleteMessage}>Delete</button>
    </div>
  );
};
export default MessagesContextMenu;
