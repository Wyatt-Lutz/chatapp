import { useState } from "react";
import LeaveChatModal from "./modals/LeaveChatModal";
const ChatRoomContextMenu = ({ contextMenuData, setContextMenu, points }) => {
  const [modal, setModal] = useState({ type: "" });

  const onLeaveGroupChat = async (e) => {
    e.stopPropagation(); //Because this is a contextmenu, when clicking the leave group chat button, the contextmenu will try to close before rendering the modal, so this line stops that action
    setModal({ type: "leaveChat" });
  };

  return (
    <div>
      <div
        className="fixed bg-zinc-800/95 border border-zinc-700 shadow-lg p-2 rounded-md text-sm"
        style={{ top: `${points.y}px`, left: `${points.x}px`, zIndex: 9999 }}
      >
        <button
          onClick={onLeaveGroupChat}
          className="w-full text-left px-3 py-2 hover:bg-zinc-700/40 rounded-md text-sm text-zinc-100"
        >
          Leave Group Chat
        </button>
      </div>

      {modal.type === "leaveChat" && (
        <div onClick={(e) => e.stopPropagation()}>
          <LeaveChatModal
            setModal={setModal}
            contextMenuData={contextMenuData}
            setContextMenu={setContextMenu}
          />
        </div>
      )}
    </div>
  );
};
export default ChatRoomContextMenu;
