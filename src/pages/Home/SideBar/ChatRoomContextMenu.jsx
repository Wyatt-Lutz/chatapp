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
        className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col"
        style={{ top: points.y, left: points.x }}
      >
        <button onClick={onLeaveGroupChat}>Leave Group Chat</button>
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
