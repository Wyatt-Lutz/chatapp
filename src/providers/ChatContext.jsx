import { createContext, useContext, useReducer } from "react";
import { ChatroomsContext } from "./ChatroomsContext";


export const ChatContext = createContext();

const initialState = {
  chatID: null,
  title: '',
  tempTitle: '',
  owner: '',
};


const chatReducer = (state, action) => {
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
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
