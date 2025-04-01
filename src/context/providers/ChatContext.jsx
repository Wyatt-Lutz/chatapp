import { createContext, useCallback, useEffect, useReducer, useState } from "react";
import { ref, onChildChanged, onChildRemoved } from "firebase/database";
import { db } from "../../../firebase";
import { chatReducer } from "../reducers/ChatReducer";
import { initialChatState } from "../initialState";
import { updateTempTitle } from "../../utils/chatroomUtils";
import { useAuth } from "./AuthContext";


export const ChatContext = createContext();
export const ResetChatContext = createContext();


export const ChatContextProvider = ({ children }) => {
  const [chatState, chatDispatch] = useReducer(chatReducer, initialChatState);
  const [isReset, setIsReset] = useState(false);
  const { currUser } = useAuth();


  const chatID = chatState.chatID;

  const resetAllChatContexts = () => {
    chatDispatch({ type: "RESET" });
    setIsReset((prev) => !prev);
  };


  useEffect(() => {
    if (!chatID) return;

    const onChatroomEdited = (snap) => {
      const prop = snap.key; //property name
      prop === 'title'
      ? chatDispatch({ type: "UPDATE_TITLE", payload: snap.val() })
      : prop === 'owner'
      ? chatDispatch({ type: "UPDATE_OWNER", payload: snap.val() })
      : prop === 'tempTitle'
      ? (
          (() => {
            const newTempTitle = updateTempTitle(snap.val(), currUser.displayName);
            chatDispatch({ type: "UPDATE_TEMP_TITLE", payload: newTempTitle });
          })()
        )
      : prop === 'firstMessageID'
      ? chatDispatch({ type: "UPDATE_FIRST_MESSAGE_ID", payload: snap.val() })
      : prop === 'memberUids'
      ? chatDispatch({ type: "UPDATE_MEMBER_UIDS", payload: snap.val() })
      : prop === 'numOfMembers'
      ? chatDispatch({ type: "UPDATE_NUM_OF_MEMBERS", payload: snap.val() })
      : null;
    }

    const onChatroomRemoved = () => {
      resetAllChatContexts();
    }

    const chatroomRef = ref(db, `chats/${chatID}`);
    const chatRoomEditedListener = onChildChanged(chatroomRef, onChatroomEdited);
    const chatroomRemovedListener = onChildRemoved(chatroomRef, onChatroomRemoved);

    return () => {
      chatRoomEditedListener();
      chatroomRemovedListener();
    }
  }, [chatID]);


  return (
    <ChatContext.Provider value={{ chatState, chatDispatch, resetAllChatContexts }}>
      <ResetChatContext.Provider value={{ isReset, setIsReset} }>
        {children}
      </ResetChatContext.Provider>
    </ChatContext.Provider>
  );
};
