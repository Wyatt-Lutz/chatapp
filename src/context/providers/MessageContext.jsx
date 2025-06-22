import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { messagesReducer } from "../reducers/messagesReducer";
import { initialMessageState } from "../initialState";
import { ChatContext } from "./ChatContext";
import { MessageListenerService } from "../listenerServices/MessageListenerService";
import { updateFirstMessageID } from "../../services/messageDataService";
import { db } from "../../../firebase";

export const MessageContext = createContext();

export const MessageContextProvider = ({ children }) => {
  const [messageState, messageDispatch] = useReducer(
    messagesReducer,
    initialMessageState,
  );
  const { chatState, chatDispatch } = useContext(ChatContext);

  const messagesRef = useRef(messageState.messages);

  useEffect(() => {
    messagesRef.current = messageState.messages;
  }, [messageState.messages]);

  useEffect(() => {
    if (!chatState.chatID) return;

    const unsubscribe = MessageListenerService.setUpMessageListeners(
      chatState.chatID,
      messageState.endTimestamp,
      {
        onMessageAdded: (messageID, messageData) => {
          if (
            //This doesn't work when a user is sending the first message because chatState.firstMessageID isn't updated yet -- Have to manually update IsFirstMessageRendered in addMessage service function
            !messageState.isFirstMessageRendered &&
            messageID === chatState.firstMessageID
          ) {
            messageDispatch({
              type: "UPDATE_IS_FIRST_MESSAGE_RENDERED",
              payload: true,
            });
          }

          messageDispatch({
            type: "ADD_MESSAGE",
            payload: { key: messageID, data: messageData },
          });
        },

        onMessageEdited: (messageID, messageData) => {
          messageDispatch({
            type: "EDIT_MESSAGE",
            payload: { key: messageID, data: messageData },
          });
        },

        onMessageDeleted: async (messageID) => {
          if (messageID === chatState.firstMessageID) {
            const messageKeys = Array.from(messagesRef.current.keys());
            const nextMessageID = messageKeys.length > 1 ? messageKeys[1] : "";
            await updateFirstMessageID(db, chatState.chatID, nextMessageID);
            chatDispatch({
              type: "UPDATE_FIRST_MESSAGE_ID",
              payload: nextMessageID,
            });
          }

          messageDispatch({ type: "REMOVE_MESSAGE", payload: messageID });
        },
      },
    );

    return unsubscribe;
  }, [chatState.chatID, messageState.isFirstMessageRendered]);

  return (
    <MessageContext.Provider value={{ messageState, messageDispatch }}>
      {children}
    </MessageContext.Provider>
  );
};
