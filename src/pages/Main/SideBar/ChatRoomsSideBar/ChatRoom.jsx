import { fetchChatRoomData } from "../../../../services/chatBarDataService";
import { db } from "../../../../../firebase";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useChatContexts, useResetChatContexts } from "../../../../hooks/useContexts";
import { updateTempTitle } from "../../../../utils/chatroomUtils";

const ChatRoom = ({chatID, chatroomData: {title, tempTitle, numUnread}}) => {
  const { chatState, chatDispatch, memberDispatch, messageDispatch } = useChatContexts();
  const {currUser} = useAuth();
  const resetContexts = useResetChatContexts();
  const handleChangeChat = async() => {
    console.log('button clicked')

    resetContexts();


    const {firstMessageID, owner, tempTitle, title, numOfMembers} = await fetchChatRoomData(db, chatID);
    const updatedTempTitle = updateTempTitle(tempTitle, currUser.displayName);
    console.log(updatedTempTitle);
    chatDispatch({ type: "CHANGE_CHAT", payload: {chatID, firstMessageID, owner, tempTitle: updatedTempTitle, title, numOfMembers}});

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
