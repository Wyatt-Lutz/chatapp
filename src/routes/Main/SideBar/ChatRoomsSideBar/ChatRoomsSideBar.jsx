import { useContext, useState, memo } from "react";
import Plus from "../../../../styling-components/Plus";
import ChatRoom from "./ChatRoom";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import ChatRoomContextMenu from "./ChatRoomContextMenu";
import ChatCreation from "./ChatCreation";
import { ChatroomsContext } from "../../../../providers/ChatroomsContext";
const ChatRoomsSideBar = () => {
  const {chatRoomsData} = useContext(ChatroomsContext);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});


  const changeChatRoomCreationState = (state) => {
    setIsCreatingChat(state);
  };

  const handleContextMenu = (e, chatroom) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    console.log(chatroom);
    setContextMenuData(chatroom.chatID);
  }


  return(
    <section>

      <button className="m-2 ring" onClick={() => setIsCreatingChat(true)}><Plus /></button>
      {isCreatingChat && (
        <ChatCreation changeChatRoomCreationState={changeChatRoomCreationState} />
      )}

      <div className="flex flex-col">
        {chatRoomsData.chatrooms && chatRoomsData.chatrooms.length > 0 ? (
          chatRoomsData.chatrooms.map(chatroom => (
            <div key={chatroom.chatID} onContextMenu={(e) => handleContextMenu(e, chatroom)}>
              <ChatRoom chatroom={chatroom} numUnread={chatRoomsData.unreadCount[chatroom.chatID]}/>
            </div>
          ))

        ) : (
            <div>You aren't in any chats</div>
        )}
      </div>

      {clicked && (
        <ChatRoomContextMenu contextMenuData={contextMenuData} points={points}/>
      )}



    </section>

  )
}
export default ChatRoomsSideBar;