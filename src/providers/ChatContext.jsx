import { onChildChanged, ref } from "firebase/database";
import { createContext, useContext, useEffect, useReducer } from "react";
import { db } from "../../firebase";
import { ChatroomsContext } from "./ChatroomsContext";


export const ChatContext = createContext();

const initialState = {
  chatID: null,
  title: '',
  tempTitle: '',
  owner: '',
};


const ChatReducer = (state, action) => {
  const { chatRoomDispatch } = useContext(ChatroomsContext);
  switch (action.type) {
    case "CHANGE_CHAT":
      chatRoomDispatch({type: "UPDATE_CHATROOM", payload: state})


      return {
        ...state,
        chatID: action.payload.chatID,
        title: action.payload.title,
        owner: action.payload.owner,
        tempTitle: action.payload.tempTitle,
      };
    case "UPDATE_TITLE":
      return {
        ...state,
        title: action.payload,
      };
    case "UPDATE_TEMP_TITLE":
      return {
        ...state,
        tempTitle: action.payload,
      };
    case "UPDATE_OWNER":
      return {
        ...state,
        owner: action.payload,
      }
    case "RESET":
      console.log('reset context')
      return initialState;

    default:
      return state;
  }
};

export const ChatContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ChatReducer, initialState);
  

  const onChatroomEdited = (snap) => {
    console.log("key" + snap.key);
    console.log("val" + snap.val());
  }

  useEffect(() => {
    const chatroomRef = ref(db, `chats/${state.chatID}`);
    const chatRoomEditedListener = onChildChanged(chatroomRef, onChatroomEdited);
  
    return () => {
      chatRoomEditedListener();
      
    }
  }, [state.chatID])
  

  return (
    <ChatContext.Provider value={{ chatRoomData: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
