import { useContext } from "react"
import { ChatContext } from "../../../../context/ChatContext";
import { fetchChatRoomData, reduceTempTitle } from "../../../../services/chatBarDataService";
import { db } from "../../../../../firebase";
import { AuthContext } from "../../../../context/AuthContext";

const ChatRoom = ({chatID, chatroomData: {title, tempTitle, numUnread}}) => {
  console.log('chatRoom run');
  const { chatState, chatDispatch, memberDispatch, messageDispatch } = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);
  const handleChangeChat = async() => {
    console.log('button clicked')
    chatDispatch({type: "RESET"});
    memberDispatch({type: "RESET"});
    messageDispatch({type: "RESET"});


    const {firstMessageID, owner, tempTitle, title} = await fetchChatRoomData(db, chatID);
    const updatedTempTitle = reduceTempTitle(tempTitle, currUser.displayName);
    chatDispatch({ type: "CHANGE_CHAT", payload: {chatID, firstMessageID, owner, tempTitle: updatedTempTitle, title}});
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