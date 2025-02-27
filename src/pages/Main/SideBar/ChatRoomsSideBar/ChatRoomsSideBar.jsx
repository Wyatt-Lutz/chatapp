import { useContext, useState } from "react";
import Plus from "../../../../components/ui/Plus";
import ChatRoom from "./ChatRoom";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import ChatRoomContextMenu from "./ChatRoomContextMenu";
import ChatCreation from "./ChatCreation";
import { ChatroomsContext } from "../../../../context/ChatroomsContext";
const ChatRoomsSideBar = () => {
  console.log('chatroomsidebar run');
  const { chatRoomsData } = useContext(ChatroomsContext);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { contextMenu, setContextMenu, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});
  const chatrooms = chatRoomsData.chatrooms;

  const changeChatRoomCreationState = (state) => {
    setIsCreatingChat(state);
  };

  const handleContextMenu = (e, chatID) => {
    e.preventDefault();
    setContextMenu({'chatroom': true});
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData(chatID);
  }


  return(
    <section>

      <button className="m-2 ring" onClick={() => setIsCreatingChat(true)}><Plus /></button>
      {isCreatingChat && (
        <ChatCreation changeChatRoomCreationState={changeChatRoomCreationState} />
      )}

      {!chatrooms ? (
        <div>Loading Chatrooms...</div>
      ) : chatrooms.size < 1 ? (
        <div>You aren't in any chats</div>
      ) : (
        <div className="flex flex-col">
          {[...chatrooms].map(([chatID, chatroomData]) => (
            <div key={chatID} onContextMenu={(e) => handleContextMenu(e, chatID)}>
              <ChatRoom chatID={chatID} chatroomData={chatroomData}/>
            </div>
          ))}
        </div>
      )}




      {contextMenu.chatroom && (
        <ChatRoomContextMenu contextMenuData={contextMenuData} points={points}/>
      )}



    </section>

  )
}
export default ChatRoomsSideBar;