import { fetchChatRoomData } from "../../../../services/chatBarDataService";
import { db } from "../../../../../firebase";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useChatContexts } from "../../../../hooks/useContexts";
import { updateTempTitle } from "../../../../utils/chatroomUtils";
import { useContext } from "react";
import { ChatroomsContext } from "../../../../context/providers/ChatroomsContext";

const ChatRoom = ({chatID, chatroomData: {title, tempTitle, numUnread}}) => {
  const { chatState, chatDispatch, resetAllChatContexts } = useChatContexts();
  const { chatRoomsDispatch } = useContext(ChatroomsContext);
  const {currUser} = useAuth();
  const handleChangeChat = async() => {
    resetAllChatContexts();


    const {firstMessageID, owner, tempTitle, title, numOfMembers} = await fetchChatRoomData(db, chatID);
    const updatedTempTitle = updateTempTitle(tempTitle, currUser.displayName);
    chatRoomsDispatch({ type: "UPDATE_CHATROOM_DATA", payload: { key: chatID, data: {title: title, tempTitle: updatedTempTitle}} });
    console.log(updatedTempTitle);
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
            {title || tempTitle}
          </>
        )}
      </button>
      <div>{numUnread}</div>

    </div>

  )
}

export default ChatRoom;
