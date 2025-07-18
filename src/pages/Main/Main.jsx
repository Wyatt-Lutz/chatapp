import ChatScreen from "./ChatScreen/ChatScreen";
import { auth } from "../../../firebase";
import ChatRoomsSideBar from "./SideBar/ChatRoomsSideBar/ChatRoomsSideBar";
import { useNavigate } from "react-router-dom";
import { signUserOut } from "../../utils/userUtils";
import { useChatContexts } from "../../hooks/useContexts";

const Main = () => {
  const navigate = useNavigate();
  const { chatroomsDispatch, resetAllChatContexts } = useChatContexts();

  const signCurrUserOut = async () => {
    await signUserOut(auth, resetAllChatContexts, chatroomsDispatch);
  };

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="flex ring flex-col">
        <ChatRoomsSideBar />
        <div className="flex">
          <button onClick={() => navigate("/settings")} className="ring p-2">
            Settings
          </button>
          <button onClick={signCurrUserOut}>Log Out</button>
        </div>
      </div>
      <ChatScreen />
    </div>
  );
};

export default Main;
