import { fetchChatRoomData } from "../../../../services/chatBarDataService";
import { db } from "../../../../../firebase";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useChatContexts } from "../../../../hooks/useContexts";
import { updateTempTitle } from "../../../../utils/chatroomUtils";

const ChatRoom = ({chatID, chatroomData}) => {
  const { chatroomsDispatch, chatState, chatDispatch, resetAllChatContexts } = useChatContexts();
  const {currUser} = useAuth();
  const handleChangeChat = async() => {
    resetAllChatContexts();


    const {firstMessageID, owner, tempTitle, title, numOfMembers} = await fetchChatRoomData(db, chatID);
    if (title !== chatroomData.title) {
      chatroomsDispatch({ type: "UPDATE_TITLE", payload: {key: chatID, data: {title: title}}});
    }

    const updatedTempTitle = updateTempTitle(tempTitle, currUser.displayName);
    if (updatedTempTitle !== chatroomData.tempTitle) {
      chatroomsDispatch({ type: "UPDATE_TEMP_TITLE", payload: {key: chatID, data: updatedTempTitle}});
    }

    chatDispatch({ type: "CHANGE_CHAT", payload: {chatID, firstMessageID, owner, tempTitle: updatedTempTitle, title, numOfMembers}});

  };

  return (

    <div className="flex">
      <button disabled={chatState.chatID === chatID} className="ring m-2" onClick={handleChangeChat}>
        {chatState.chatID === chatID ? (
          <>
            {chatState.title || chatState.tempTitle}
          </>

        ) : (
          <>
            {chatroomData.title || chatroomData.tempTitle}
          </>
        )}
      </button>
      <div>{chatroomData.numUnread}</div>

    </div>

  )
}

export default ChatRoom;
