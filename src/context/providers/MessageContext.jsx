import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { messagesReducer } from "../reducers/messagesReducer";
import { initialMessageState } from "../initialState";
import { ChatContext, ResetChatContext } from "./ChatContext";
import { MessageListenerService } from "../listenerServices/messageListenerService";
import { updateFirstMessageID } from "../../services/messageDataService";
import { db } from "../../../firebase";


export const MessageContext = createContext();



export const MessageContextProvider = ({ children }) => {
  const [messageState, messageDispatch] = useReducer(messagesReducer, initialMessageState);
  const { chatState, chatDispatch } = useContext(ChatContext);
  const { isReset, setIsReset } = useContext(ResetChatContext);

  const messages = useRef(messageState.messages);

  useEffect(() => {
    messages.current = messageState.messages;
    console.log(messageState.messages);
  }, [messageState.messages]);


  useEffect(() => {
    if (!chatState.chatID) return;

    if (isReset) {
      setIsReset(!isReset);
      messageDispatch({ type: "RESET" });
    }

    const unsubscribe = MessageListenerService.setUpMessageListeners(chatState.chatID, messageState.endTimestamp, {
      onMessageAdded: (messageID, messageData) => {

        if (!messageState.isFirstMessageRendered && (messageID === chatState.firstMessageID)) {
          messageDispatch({type: "UPDATE_IS_FIRST_MESSAGE_RENDERED", payload: true});
        }

        messageDispatch({type: "ADD_MESSAGE", payload: {key: messageID, data: messageData}});


      },

      onMessageEdited: (messageID, messageData) => {
        const message = messages.current.get(messageID);
        if (!message) return;

        for (const property in messageData) {
          message[property] = messageData[property];
        }

        messageDispatch({type: "EDIT_MESSAGE", payload: {key: messageID, data: message}});
      },

      onMessageDeleted: async(messageID) => {
        if (messageID === chatState.firstMessageID) {
          const messageKeys = Array.from(messages.current.keys());
          const nextMessageID = messageKeys.length > 1 ? messageKeys[1] : "";
          await updateFirstMessageID(db, chatState.chatID, nextMessageID);
          chatDispatch({ type: "UPDATE_FIRST_MESSAGE_ID", payload: nextMessageID });
        }

        messageDispatch({type: "REMOVE_MESSAGE", payload: messageID});
      }
    });

    return unsubscribe;
  }, [chatState.chatID, chatState.firstMessageID, isReset, messageState.isAtBottom, messageState.numUnread, messageState.endTimestamp, messageState.isFirstMessageRendered]);


  return (
    <MessageContext.Provider value={{ messageState, messageDispatch }}>
      {children}
    </MessageContext.Provider>
  );
};
