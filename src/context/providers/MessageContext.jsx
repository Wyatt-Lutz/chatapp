import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { messagesReducer } from "../reducers/messagesReducer";
import { initialMessageState } from "../initialState";
import { ChatContext, ResetChatContext } from "./ChatContext";
import { MessageListenerService } from "../listenerServices/messageListenerService";


export const MessageContext = createContext();



export const MessageContextProvider = ({ children }) => {
  const [messageState, messageDispatch] = useReducer(messagesReducer, initialMessageState);
  const { chatState } = useContext(ChatContext);
  const { isReset, setIsReset } = useContext(ResetChatContext);

  const messages = useRef(messageState.messages);

  useEffect(() => {
    messages.current = messageState.messages;
  }, [messageState.messages]);


  useEffect(() => {
    if (!chatState.chatID) return;

    if (isReset) {
      setIsReset(!isReset);
      messageDispatch({ type: "RESET" });
    }

    const unsubscribe = MessageListenerService.setUpMessageListeners(chatState.chatID, messageState.endTimestamp, {
      onMessageAdded: (messageID, messageData) => {
        messageDispatch({type: "ADD_MESSAGE", payload: {key: messageID, data: messageData}});

        if (messageState.messages.size === 0) {
          messageDispatch({type: "UPDATE_END_TIMESTAMP", payload: messageData.timestamp});
        }

        if (!messageState.isFirstMessageRendered && (messageID == chatState.firstMessageID)) {
          messageDispatch({type: "UPDATE_IS_FIRST_MESSAGE_RENDERED", payload: true});
        }


        if (!messageState.isAtBottom) {
          messageDispatch({type: "UPDATE_UNREAD", payload: (numUnread.current + 1)});
        }

      },

      onMessageEdited: (messageID, messageData) => {
        const message = messageState.messages.get(messageID);
        if (!message) return;

        for (const property in messageData) {
          message[property] = messageData[property];
        }

        messageDispatch({type: "EDIT_MESSAGE", payload: {key: messageID, data: message}});
      },

      onMessageDeleted: (messageID) => {
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
