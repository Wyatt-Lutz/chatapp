import { memo, useContext } from "react"
import { ChatContext } from "../../../../providers/ChatContext";

const ChatRoom = ({chatroom, numUnread}) => {
  console.log('chat room')
  const { dispatch } = useContext(ChatContext);

  const handleChangeChat = () => {
    dispatch({ type: "CHANGE_CHAT", payload: { chatID: chatroom.chatID, title: chatroom.title, owner: chatroom.owner }});
  };

  return (

    <div className="flex">
      <button className="ring m-2" onClick={handleChangeChat}>
        {chatroom.title || chatroom.tempTitle}
      </button> 
      <div>{numUnread}</div>

    </div>

  )
}

export default ChatRoom;