import { limitToLast, orderByChild, query, startAt, ref } from "firebase/database";
import { createContext, useContext, useEffect, useReducer } from "react";
import { db } from "../../firebase";
import { ChatContext } from "./ChatContext";


export const MessagesContext = createContext();

const initialState = {
  messages: [],
  endTimestamp: 0,
  numUnread: 0,
  isAtBottom: true,
};

const messagesReducer = (state, action) => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "ADD_OLDER_MESSAGES":
      return {
        ...state,
        messages: [...action.payload, ...state.messages],
      }
    case "EDIT_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: delete messages.action.payload,
      };
    case "UPDATE_END_TIMESTAMP":
      return {
        ...state,
        endTimestamp: action.payload,
      };
    case "EDIT_AT_BOTTOM_STATUS":
      return {
        ...state,
        isAtBottom: action.payload,
      }
    case "UPDATE_UNREAD":
      return {
        ...state,
        numUnread: action.payload,
      }
    


      default:
        return state;

  }
}


export const MessagesContextProvider = ({ children }) => {
  const { chatRoomData } = useContext(ChatContext);
  
  const [state, dispatch] = useReducer(messagesReducer, initialState);

  useEffect(() => {
    if (!chatRoomData) return;
    const handleMessageAdded = (snap) => {
      console.log("key:" + snap.key);
      console.log("data:" + snap.val());
      if (state.messages.length === 0) {
        dispatch({type: "UPDATE_END_TIMESTAMP", payload: snap.val().timestamp});
      }
  
      if (!state.isAtBottom) {
        dispatch({type: "UPDATE_UNREAD", payload: (state.numUnread + 1)});
      }
  
      dispatch({type: "ADD_MESSAGE", payload: {[snap.key]: snap.val()}});
    }
  
    const handleMessageEdited = (snap) => {
      dispatch({type: "EDIT_MESSAGE", payload: {[snap.key]: snap.val()}});
    }
  
    const handleMessageDeleted = (snap) => {
      dispatch({type: "REMOVE_MESSAGE", payload: snap.key});
  
    }

    const chatsRef = ref(db, "messages/" + chatRoomData.chatID + "/");
    const addedListenerQuery = query(chatsRef, orderByChild("timestamp"), startAt(state.endTimestamp), limitToLast(10));
    const otherListenersQuery = query(chatsRef, orderByChild("timestamp"), startAt(state.endTimestamp));

    
    const chatAddedListener = onChildAdded(addedListenerQuery, handleMessageAdded);
    const chatChangedListener = onChildChanged(otherListenersQuery, handleMessageEdited);
    const chatRemovedListener = onChildRemoved(otherListenersQuery, handleMessageDeleted);

    return () => {
      chatAddedListener();
      chatChangedListener();
      chatRemovedListener();
    };
  },[chatRoomData])

  return (
    <MessagesContext.Provider value={{ data: state, dispatch }}>
      { children }
    </MessagesContext.Provider>
  )
}

