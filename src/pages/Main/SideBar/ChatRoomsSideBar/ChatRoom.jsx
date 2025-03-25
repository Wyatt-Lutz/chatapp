import { fetchChatRoomData } from "../../../../services/chatBarDataService";
import { db } from "../../../../../firebase";
import { useAuth } from "../../../../context/providers/AuthContext";
import { reduceTempTitle } from "../../../../utils/chatroomUtils";
import useChatContexts from "../../../../hooks/useContexts";

const ChatRoom = ({chatID, chatroomData: {title, tempTitle, numUnread}}) => {
  const { chatState, chatDispatch, memberDispatch, messageDispatch } = useChatContexts();
  const {currUser} = useAuth();
  const handleChangeChat = async() => {
    console.log('button clicked')
    chatDispatch({type: "RESET"});
    memberDispatch({type: "RESET"});
    messageDispatch({type: "RESET"});


    const {firstMessageID, owner, tempTitle, title} = await fetchChatRoomData(db, chatID);
    const updatedTempTitle = reduceTempTitle(tempTitle, currUser.displayName);
    console.log(updatedTempTitle);
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
