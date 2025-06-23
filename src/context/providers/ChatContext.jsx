import { createContext, useContext, useEffect, useReducer } from "react";
import { chatReducer } from "../reducers/chatReducer";
import { initialChatState } from "../initialState";
import { updateTempTitle } from "../../utils/chatroomUtils";
import { useAuth } from "./AuthContext";
import { ChatroomsContext } from "./ChatroomsContext";
import { ChatListenerService } from "../listenerServices/ChatListenerService";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [chatState, chatDispatch] = useReducer(chatReducer, initialChatState);
  const { chatroomsDispatch } = useContext(ChatroomsContext);
  const { currUser } = useAuth();
  const { chatID } = chatState;

  useEffect(() => {
    if (!chatID) return;

    const unsubscribe = ChatListenerService.setUpChatListeners(chatID, {
      onTitleChanged: (title) => {
        chatDispatch({ type: "UPDATE_TITLE", payload: title });
        chatroomsDispatch({
          type: "UPDATE_TITLE",
          payload: { key: chatID, data: title },
        });
      },
      onOwnerChanged: (ownerUid) => {
        chatDispatch({ type: "UPDATE_OWNER", payload: ownerUid });
      },
      onTempTitleChanged: (tempTitle) => {
        const newTempTitle = updateTempTitle(tempTitle, currUser.displayName);
        chatDispatch({ type: "UPDATE_TEMP_TITLE", payload: newTempTitle });
        chatroomsDispatch({
          type: "UPDATE_TEMP_TITLE",
          payload: { key: chatID, data: newTempTitle },
        });
      },
      onFirstMessageIDChanged: (firstMessageID) => {
        chatDispatch({
          type: "UPDATE_FIRST_MESSAGE_ID",
          payload: firstMessageID,
        });
      },
      onMemberUidsChanged: (memberUids) => {
        chatDispatch({ type: "UPDATE_MEMBER_UIDS", payload: memberUids });
        chatroomsDispatch({
          type: "UPDATE_MEMBER_UIDS",
          payload: { key: chatID, data: memberUids },
        });
      },
      onNumOfMembersChanged: (numOfMembers) => {
        chatDispatch({ type: "UPDATE_NUM_OF_MEMBERS", payload: numOfMembers });
      },
      onLastMessageTimestampChange: (lastMessageTimestamp) => {
        chatroomsDispatch({
          type: "UPDATE_LAST_MESSAGE_TIMESTAMP",
          payload: { key: chatID, data: lastMessageTimestamp },
        });
      },
    });

    return unsubscribe;
  }, [chatID, currUser, chatDispatch, chatroomsDispatch]);

  return (
    <ChatContext.Provider value={{ chatState, chatDispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
