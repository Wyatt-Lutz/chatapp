import { createContext, useContext, useEffect, useReducer } from "react";
import { limitToLast, orderByChild, query, startAt, ref, onChildAdded, onChildChanged, onChildRemoved } from "firebase/database";
import { db } from "../../../firebase";
import { messagesReducer } from "../reducers/messagesReducer";
import { initialMessageState } from "../initialState";
import { ChatContext, ResetChatContext } from "./ChatContext";


export const MessageContext = createContext();



export const MessageContextProvider = ({ children }) => {
  const [messageState, messageDispatch] = useReducer(messagesReducer, initialMessageState);
  const { chatState } = useContext(ChatContext);
  const { isReset, setIsReset } = useContext(ResetChatContext);



  const chatID = chatState.chatID;
  const messages = messageState.messages;
  const endTimestamp = messageState.endTimestamp;
  const numUnread = messageState.numUnread;
  const isAtBottom = messageState.isAtBottom;
  const isFirstMessageRendered = messageState.isFirstMessageRendered;


  useEffect(() => {
    if (!chatID) return;

    if (isReset) {
      setIsReset(!isReset);
      messageDispatch({ type: "RESET" });
    }

    const handleMessageAdded = (snap) => {
      if (messages.size === 0) {
        messageDispatch({type: "UPDATE_END_TIMESTAMP", payload: snap.val().timestamp});

      }

      if (!isFirstMessageRendered && (snap.key == chatState.firstMessageID)) {
        messageDispatch({type: "UPDATE_IS_FIRST_MESSAGE_RENDERED", payload: true});
      }


      if (!isAtBottom) {
        messageDispatch({type: "UPDATE_UNREAD", payload: (numUnread + 1)});
      }

      messageDispatch({type: "ADD_MESSAGE", payload: {key: snap.key, data: snap.val()}});
    }

    const handleMessageEdited = (snap) => {
      const message = messages.get(snap.key);
      if (!message) return;
      const data = snap.val();

      for (const property in data) {
        message[property] = data[property];
      }

      messageDispatch({type: "EDIT_MESSAGE", payload: {key: snap.key, data: message}});
    }

    const handleMessageDeleted = (snap) => {
      messageDispatch({type: "REMOVE_MESSAGE", payload: snap.key});
    }

    const chatsRef = ref(db, `messages/${chatID}/`);
    const addedListenerQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp), limitToLast(10));
    const otherListenersQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp));


    const chatAddedListener = onChildAdded(addedListenerQuery, handleMessageAdded);
    const chatChangedListener = onChildChanged(otherListenersQuery, handleMessageEdited);
    const chatRemovedListener = onChildRemoved(otherListenersQuery, handleMessageDeleted);

    return () => {
      chatAddedListener();
      chatChangedListener();
      chatRemovedListener();
    };
  }, [chatID, isReset, isAtBottom, numUnread, endTimestamp]);


  return (
    <MessageContext.Provider value={{ messageState, messageDispatch }}>
      {children}
    </MessageContext.Provider>
  );
};
