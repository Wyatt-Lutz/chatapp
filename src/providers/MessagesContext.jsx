import { limitToLast, orderByChild, query, startAt, ref, onChildAdded, onChildChanged, onChildRemoved } from "firebase/database";
import { createContext, useContext, useEffect, useReducer } from "react";
import { db } from "../../firebase";
import { ChatContext } from "./ChatContext";


export const MessagesContext = createContext();

const initialState = {
  messages: new Map(),
  endTimestamp: 0,
  numUnread: 0,
  isAtBottom: true,
};

const messagesReducer = (state, action) => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: state.messages.set(action.payload.key, action.payload.data)
      };
    case "ADD_OLDER_MESSAGES":
      return {
        ...state,
        messages: new Map([...state.messages, ...action.payload]),
      }
    case "EDIT_MESSAGE":
      return {
        ...state,
        messages: state.messages.set(action.payload.key, action.payload.data),
      };
    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: state.messages.delete(action.payload),
      };
    case "UPDATE_END_TIMESTAMP":
      return {
        ...state,
        endTimestamp: action.payload,
      };
    case "UPDATE_AT_BOTTOM":
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
    if (!chatRoomData.chatID) return;
    const handleMessageAdded = (snap) => {
      console.log("key:" + snap.key);
      console.log("data:" + snap.val());
      if (state.messages.size === 0) {
        dispatch({type: "UPDATE_END_TIMESTAMP", payload: snap.val().timestamp});
      }
  
      if (!state.isAtBottom) {
        dispatch({type: "UPDATE_UNREAD", payload: (state.numUnread + 1)});
      }
  
      dispatch({type: "ADD_MESSAGE", payload: {key: snap.key, data: snap.val()}});
    }
  
    const handleMessageEdited = (snap) => {
      const message = state.messages.get(snap.key);
      if (!message) return;
      for (const prop in snap.val()) {
        if (Object.prototype.hasOwnProperty.call(snap.val(), prop)) {
          message[prop] = snap.val()[prop];
        }
      }
      dispatch({type: "EDIT_MESSAGE", payload: {key: snap.key, data: message}});
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
  },[chatRoomData.chatID, state.endTimestamp, state.numUnread, state.isAtBottom, state.messages])

  return (
    <MessagesContext.Provider value={{ messagesData: state, dispatch }}>
      { children }
    </MessagesContext.Provider>
  )
}

