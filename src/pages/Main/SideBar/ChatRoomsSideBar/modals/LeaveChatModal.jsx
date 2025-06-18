import { db } from "../../../../../../firebase";
import { useAuth } from "../../../../../context/providers/AuthContext";
import { useChatContexts } from "../../../../../hooks/useContexts";
import {
  fetchMembersFromChat,
  removeUserFromChat,
} from "../../../../../services/memberDataService";

import CloseModal from "../../../../../components/ui/CloseModal";

const LeaveChatModal = ({ setModal, contextMenuData, setContextMenu }) => {
  const { currUser } = useAuth();
  const { chatDispatch, resetAllChatContexts, memberState } = useChatContexts();

  const onLeaveChat = async () => {
    setContextMenu({});
    setModal({ type: "" });

    await removeUserFromChat(
      db,
      contextMenuData.chatID,
      currUser.uid,
      currUser.displayName,
      currUser.uid,
      contextMenuData.numOfMembers,
      chatDispatch,
      resetAllChatContexts,
      memberState.members,
    );
  };

  const onClose = () => {
    setModal({ type: "" });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button onClick={onClose} className="absolute top-4 right-4">
          <CloseModal />
        </button>

        <div>Are you sure you want to leave</div>

        <div className="flex justify-end space-x-2">
          <button onClick={onLeaveChat}>Leave</button>
          <button onClick={onClose} className="px-4 py-2 text-white">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default LeaveChatModal;
