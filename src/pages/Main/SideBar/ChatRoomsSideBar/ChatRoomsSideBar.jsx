import { useState } from "react";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import { useChatContexts } from "../../../../hooks/useContexts";
import Plus from "../../../../components/ui/Plus";
import ChatRoom from "./ChatRoom";

import ChatRoomContextMenu from "./ChatRoomContextMenu";
import ChatCreationModal from "./modals/ChatCreationModal";

const ChatRoomsSideBar = () => {
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
    <section>
      <button className="m-2 ring" onClick={() => setIsCreatingChat(true)}>
        <Plus />
      </button>
      {isCreatingChat && (
        <ChatCreationModal
          changeChatRoomCreationState={changeChatRoomCreationState}
        />
      )}

      {!chatrooms ? (
        <div>Loading Chatrooms...</div>
      ) : chatrooms.size < 1 ? (
        <div>You aren't in any chats</div>
      ) : (
        <div className="flex flex-col">
          {[...chatrooms]
            .sort(
              ([, a], [, b]) => b.lastMessageTimestamp - a.lastMessageTimestamp, //Sorts the chatrooms so the ones with the most recent messages are at the top
            )
            .map(([chatID, chatroomData]) => (
              <div
                key={chatID}
                onContextMenu={(e) => handleContextMenu(e, chatID)}
              >
                <ChatRoom chatID={chatID} chatroomData={chatroomData} />
              </div>
            ))}
        </div>
      )}

      {contextMenu.chatroom && (
        <ChatRoomContextMenu
          contextMenuData={contextMenuData}
          setContextMenu={setContextMenu}
          points={points}
        />
      )}
    </section>
  );
};
export default ChatRoomsSideBar;
