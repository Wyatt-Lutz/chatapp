import ChatScreen from "./ChatScreen/ChatScreen";
import ChatRoomsSideBar from "./SideBar/ChatRoomsSideBar";
import { useNavigate } from "react-router-dom";
import { signUserOut } from "../../utils/userUtils";
import { useChatContexts } from "../../hooks/useContexts";
import { useToast } from "../../context/ToastContext";
import { auth } from "../../firebase";
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { chatroomsDispatch, resetAllChatContexts } = useChatContexts();
  const { showToast } = useToast();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const signCurrUserOut = async () => {
    await signUserOut(auth, resetAllChatContexts, chatroomsDispatch);
  };

  return (
    <div className="h-screen w-screen flex items-stretch bg-zinc-900 text-zinc-100 relative">
      <div
        className={`shrink-0 flex items-center transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-0 p-0" : "w-auto p-4"
        }`}
      >
        <div
          className={`transition-opacity duration-300 ${
            isSidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <ChatRoomsSideBar
            onCollapse={() => setIsSidebarCollapsed(true)}
            isCollapsed={isSidebarCollapsed}
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <ChatScreen
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        <div className="absolute bottom-4 left-[calc(100%-17.8rem)] w-72 flex items-center justify-center gap-3 z-10">
          <button
            onClick={() => navigate("/settings")}
            className="px-4 py-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 backdrop-blur-sm border border-zinc-700 shadow-lg transition"
          >
            Settings
          </button>
          <button
            onClick={signCurrUserOut}
            className="px-4 py-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 backdrop-blur-sm border border-zinc-700 shadow-lg transition"
          >
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
