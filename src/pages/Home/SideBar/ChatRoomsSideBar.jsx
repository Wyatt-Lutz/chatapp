import { useState } from "react";
import { useContextMenu } from "../../../hooks/useContextMenu";
import { useChatContexts } from "../../../hooks/useContexts";
import ChatRoom from "./ChatRoom";
import Sidebar from "../../../components/Sidebar/Sidebar";

import ChatRoomContextMenu from "./ChatRoomContextMenu";
import ChatCreationModal from "./modals/ChatCreationModal";

const ChatRoomsSideBar = ({ onCollapse, isCollapsed }) => {
  const { chatroomsState } = useChatContexts();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { contextMenu, setContextMenu, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});
  const chatrooms = chatroomsState.chatrooms;

  const changeChatRoomCreationState = (state) => {
    setIsCreatingChat(state);
  };

  const handleContextMenu = (e, chatID) => {
    e.preventDefault();
    setContextMenu({ chatroom: true });
    setPoints({ x: e.pageX, y: e.pageY });
    setContextMenuData({ chatID: chatID });
  };

  return (
    <>
      <Sidebar
        title="Chatrooms"
        className="w-80"
        onCollapse={onCollapse}
        isCollapsed={isCollapsed}
      >
        <div className="flex items-center justify-between">
          {chatrooms && chatrooms.size >= 1 && (
            <button
              aria-label="Create chat"
              onClick={() => setIsCreatingChat(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-linear-to-br from-violet-600 to-fuchsia-600 px-3 py-1.5 text-white shadow-md hover:opacity-95 transition"
            >
              <span className="text-sm">Create Chatroom</span>
            </button>
          )}
        </div>

        <div className="mt-3">
          {!chatrooms ? (
            <div className="px-3 py-6 text-sm text-zinc-400">
              Loading chatrooms...
            </div>
          ) : chatrooms.size < 1 ? (
            <div className="px-3 py-6">
              <div className="rounded-xl border border-zinc-700/70 bg-zinc-800/40 p-5 text-center">
                <div className="text-sm font-semibold text-zinc-100">
                  No chats yet
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Create your first group to start chatting.
                </p>
                <button
                  aria-label="Create chat"
                  onClick={() => setIsCreatingChat(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-linear-to-br from-violet-600 to-fuchsia-600 px-3 py-1.5 text-white shadow-md hover:opacity-95 transition"
                >
                  <span className="text-sm">Create Chatroom</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from(chatrooms).map((chatroom) => (
                <ChatRoom
                  key={chatroom[0]}
                  chatID={chatroom[0]}
                  chatroomData={chatroom[1]}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </div>
          )}
        </div>

        {contextMenu.chatroom && (
          <ChatRoomContextMenu
            contextMenuData={contextMenuData}
            points={points}
            setContextMenu={setContextMenu}
          />
        )}
      </Sidebar>

      {isCreatingChat && (
        <ChatCreationModal
          changeChatRoomCreationState={changeChatRoomCreationState}
        />
      )}
    </>
  );
};
export default ChatRoomsSideBar;
