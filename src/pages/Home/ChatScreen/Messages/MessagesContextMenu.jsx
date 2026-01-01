import { deleteMessage } from "../../../../services/messageDataService";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useChatContexts } from "../../../../hooks/useContexts";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../../../../firebase";
const MessagesContextMenu = ({
  changeEditState,
  contextMenuData: { messageUid, messageData },
  points,
}) => {
  const { chatState } = useChatContexts();
  const { currUser } = useAuth();

  const handleDeleteMessage = async () => {
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
      className="fixed bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl p-1 flex flex-col min-w-max z-50"
      style={{ top: points.y, left: points.x }}
    >
      {messageData.sender === currUser.uid && (
        <>
          <button
            onClick={() => changeEditState(messageUid, true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700/70 rounded transition"
          >
            <svg
              className="w-4 h-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Edit</span>
          </button>
          <div className="border-t border-zinc-700 my-1" />
        </>
      )}
      <button
        onClick={handleDeleteMessage}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded transition text-red-400 hover:bg-red-600/10"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span>Delete</span>
      </button>
    </div>
  );
};
export default MessagesContextMenu;
