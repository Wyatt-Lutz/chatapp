import { useChatContexts } from "../../../hooks/useContexts";
import { useChatroomPresence } from "../../../hooks/useChatroomPresence";
import { useAuth } from "../../../context/providers/AuthContext";
import { useState } from "react";

import TopBar from "./Ancillary/TopBar";
import Messages from "./Messages/Messages";
import MembersBar from "./MembersBar/MembersBar";
import Search from "./Ancillary/Search";

const ChatScreen = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const { chatState } = useChatContexts();
  const { currUser } = useAuth();
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);

  useChatroomPresence(chatState.chatID, currUser.uid);
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {!chatState.chatID ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md w-full">
            <h2 className="text-xl font-semibold text-zinc-100">Welcome</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Select a chat from the sidebar or create a new one.
            </p>
            {isSidebarCollapsed && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 backdrop-blur-sm border border-zinc-700 shadow-lg transition"
                >
                  Open Sidebar
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <TopBar
            setIsSearchingMessages={setIsSearchingMessages}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
          />
          <div
            className={`flex-1 flex overflow-hidden min-h-0 transition-all duration-300 ${
              !isSidebarCollapsed ? "md:ml-80" : ""
            }`}
          >
            <Messages isSidebarCollapsed={isSidebarCollapsed} />

            {isSearchingMessages ? (
              <Search setIsSearchingMessages={setIsSearchingMessages} />
            ) : (
              <MembersBar />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatScreen;
