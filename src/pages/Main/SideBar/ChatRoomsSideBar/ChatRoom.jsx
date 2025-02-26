import { useContext } from "react"
import { ChatContext } from "../../../../context/ChatContext";
import { fetchChatRoomData } from "../../../../services/chatBarDataService";
import { db } from "../../../../../firebase";

const ChatRoom = ({chatID, chatroomData: {title, tempTitle, numUnread}}) => {
  console.log('chatRoom run');
  const { chatState, chatDispatch, memberDispatch, messageDispatch } = useContext(ChatContext);
  const handleChangeChat = async() => {
    chatDispatch({type: "RESET"});
    memberDispatch({type: "RESET"});
    messageDispatch({type: "RESET"});


    const {firstMessageID, owner, tempTitle, title} = await fetchChatRoomData(db, chatID);
    chatDispatch({ type: "CHANGE_CHAT", payload: {chatID, firstMessageID, owner, tempTitle, title}});
  };

  return (

    <div className="flex">
      <button className="ring m-2" onClick={handleChangeChat}>
        {chatState.chatID === chatID ? (
          <>
            {chatState.title || chatState.tempTitle}
          </>

        ) : (
          <>
            {title || tempTitle}
          </>
        )}
      </button>
      <div>{numUnread}</div>

    </div>

  )
}

export default ChatRoom;