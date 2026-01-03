import { useState } from "react";
import { useContextMenu } from "../../../hooks/useContextMenu";
import { useChatContexts } from "../../../hooks/useContexts";
import ChatRoom from "./ChatRoom";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import { signUserOut } from "../../../utils/userUtils";
import { auth } from "../../../firebase";

import ChatRoomContextMenu from "./ChatRoomContextMenu";
import ChatCreationModal from "./modals/ChatCreationModal";

const ChatRoomsSideBar = ({
  onCollapse,
  isCollapsed,
  setIsSidebarCollapsed,
}) => {
  const { chatroomsState, chatroomsDispatch, resetAllChatContexts } =
    useChatContexts();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { contextMenu, setContextMenu, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});
  const chatrooms = chatroomsState.chatrooms;
  const navigate = useNavigate();

  const changeChatRoomCreationState = (state) => {
    setIsCreatingChat(state);
  };

  const handleContextMenu = (e, chatID) => {
    e.preventDefault();
    setContextMenu({ chatroom: true });
    setPoints({ x: e.clientX, y: e.clientY });
    setContextMenuData({ chatID: chatID });
  };

  const signCurrUserOut = async () => {
    await signUserOut(auth, resetAllChatContexts, chatroomsDispatch);
  };

  return (
    <>
      <Sidebar
        title="Chatrooms"
        className="w-full md:w-80"
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
                  setIsSidebarCollapsed={setIsSidebarCollapsed}
                />
              ))}
            </div>
          )}
        </div>

        <div className="md:hidden mt-6 pt-4 border-t border-zinc-700/70 space-y-2">
          <button
            onClick={() => navigate("/settings")}
            className="w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 shadow-lg transition text-zinc-100"
          >
            Settings
          </button>
          <button
            onClick={signCurrUserOut}
            className="w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 shadow-lg transition text-zinc-100"
          >
            Log Out
          </button>
        </div>
      </Sidebar>

      {contextMenu.chatroom && (
        <ChatRoomContextMenu
          contextMenuData={contextMenuData}
          points={points}
          setContextMenu={setContextMenu}
        />
      )}

      {isCreatingChat && (
        <ChatCreationModal
          changeChatRoomCreationState={changeChatRoomCreationState}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
      )}
    </>
  );
};
export default ChatRoomsSideBar;
