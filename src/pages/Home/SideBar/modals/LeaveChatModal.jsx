import { db } from "../../../../firebase";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useChatContexts } from "../../../../hooks/useContexts";
import { removeUserFromChat } from "../../../../services/memberDataService";

import CloseModal from "../../../../components/ui/CloseModal";
import { fetchChatRoomData } from "../../../../services/chatBarDataService";

const LeaveChatModal = ({ setModal, contextMenuData, setContextMenu }) => {
  const { currUser } = useAuth();
  const { memberState, chatState } = useChatContexts();

  const onLeaveChat = async () => {
    setContextMenu({});
    setModal({ type: "" });
    let updatedContextMenuData;
    if (chatState.chatID !== contextMenuData.chatID) {
      const chatroomData = await fetchChatRoomData(db, contextMenuData.chatID);
      updatedContextMenuData = {
        ...contextMenuData,
        numOfMembers: chatroomData.numOfMembers,
        membersTitle: chatroomData.membersTitle,
        ownerUid: chatroomData.owner,
        memberUids: chatroomData.memberUids,
      };
    }

    await removeUserFromChat(
      db,
      chatState.chatID !== contextMenuData.chatID
        ? updatedContextMenuData
        : chatState,
      currUser.uid,
      currUser.displayName,
      currUser.uid,
      memberState.members,
    );
  };

  const onClose = () => {
    setModal({ type: "" });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/60 z-50">
      <div className="relative w-full max-w-md p-6 bg-zinc-800/95 rounded-xl shadow-2xl border border-zinc-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          aria-label="Close leave chat modal"
        >
          <CloseModal />
        </button>

        <h3 className="text-lg font-semibold text-zinc-100 mb-3">Leave Chat</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Are you sure you want to leave this chat? You can be re-invited later
          if needed.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onLeaveChat}
            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-500"
          >
            Leave
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-700 text-zinc-100 rounded-md hover:bg-zinc-700/80"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default LeaveChatModal;
