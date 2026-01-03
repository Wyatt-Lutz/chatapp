import ChatScreen from "./ChatScreen/ChatScreen";
import ChatRoomsSideBar from "./SideBar/ChatRoomsSideBar";
import { useNavigate } from "react-router-dom";
import { signUserOut } from "../../utils/userUtils";
import { useChatContexts } from "../../hooks/useContexts";
import { auth } from "../../firebase";
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { chatroomsDispatch, resetAllChatContexts, chatState } =
    useChatContexts();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    window.innerWidth < 768,
  );

  const signCurrUserOut = async () => {
    await signUserOut(auth, resetAllChatContexts, chatroomsDispatch);
  };

  return (
    <div className="relative h-screen w-screen text-zinc-100 overflow-hidden">
      <div
        className={`fixed inset-0 z-30 transition-opacity duration-300 ${
          chatState.chatID ? "bg-black/50 backdrop-blur-sm" : ""
        } ${
          isSidebarCollapsed
            ? "opacity-0 pointer-events-none"
            : chatState.chatID
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarCollapsed(true)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-40 md:w-80 px-4 py-4 transition-all duration-300 flex items-center justify-center ${
          isSidebarCollapsed
            ? "-translate-x-full opacity-0 pointer-events-none"
            : "translate-x-0 opacity-100"
        }`}
      >
        <ChatRoomsSideBar
          onCollapse={() => setIsSidebarCollapsed(true)}
          isCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
      </div>

      <main className="relative h-full flex flex-col overflow-hidden">
        <ChatScreen
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        <div className="hidden md:flex absolute bottom-4 right-4 items-center justify-center gap-3 z-10 md:left-[calc(100%-15.1rem)] md:right-auto">
          <button
            onClick={() => navigate("/settings")}
            className="px-4 py-2 text-base rounded-lg bg-zinc-800/90 hover:bg-zinc-700 backdrop-blur-sm border border-zinc-700 shadow-lg transition"
          >
            Settings
          </button>
          <button
            onClick={signCurrUserOut}
            className="px-4 py-2 text-base rounded-lg bg-zinc-800/90 hover:bg-zinc-700 backdrop-blur-sm border border-zinc-700 shadow-lg transition"
          >
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
