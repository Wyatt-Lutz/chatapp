import { useChatContexts } from "../../../hooks/useContexts";
import { useChatroomPresence } from "../../../hooks/useChatroomPresence";
import { useAuth } from "../../../context/providers/AuthContext";

import TopBar from "./Ancillary/TopBar";
import Messages from "./Messages/Messages";
import MembersBar from "./MembersBar/MembersBar";

const ChatScreen = () => {
  const { chatState } = useChatContexts();
  const { currUser } = useAuth();

  useChatroomPresence(chatState.chatID, currUser.uid);
  return (
    <div>
      {!chatState.chatID ? (
        <div className="flex flex-1 items-center justify-center text-xl">
          Start chatting
        </div>
      ) : (
        <>
          <TopBar />
          <div className="flex">
            <Messages />

            <MembersBar />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatScreen;
