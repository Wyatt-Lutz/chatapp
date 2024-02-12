import { createContext, useReducer } from "react";


export const ChatContext = createContext();
export const ChatContextProvider = ({ children }) => {
  const initialState = {
    chatID: null,
    user: {},
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_CHAT":
        return {
          chatID: action.payload,
        };

        default:
          return state;
    }
  }
  const [state, dispatch] = useReducer(chatReducer, initialState);
  return(
    <ChatContext.Provider value={{ data: state, dispatch}}>
      {children}
    </ChatContext.Provider>
  )
};

