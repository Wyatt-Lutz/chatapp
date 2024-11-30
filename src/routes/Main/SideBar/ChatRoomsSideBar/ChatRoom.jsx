import { memo, useContext } from "react"
import { ChatContext } from "../../../../providers/ChatProvider";

const ChatRoom = ({chat, numUnread}) => {
  console.log('chat room')
  const { data, dispatch } = useContext(ChatContext);

  const handleChangeChat = (chatID, title, owner) => {
    console.log(chatID);
    dispatch({ type: "CHANGE_CHAT", payload: { chatID, title, owner }});
  };

  return (

    <div className="flex">
      <button className="ring m-2" onClick={() => handleChangeChat(chat.id, chat.title, chat.owner)}>
        {(data.chatID === chat.id && data.title) ? data.title : chat.title}
      </button>
      <div>{numUnread}</div>

    </div>

  )
}

export default memo(ChatRoom);