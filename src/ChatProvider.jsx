import { createContext, useReducer, useContext } from "react";
import { AuthContext } from "./AuthProvider";

export const ChatContext = createContext();
export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const initialState = {
    chatID: null,
    user: {},
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_CHAT":
        return {
          user: action.payload,
          chatID: currentUser.uid + action.payload.uid,
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

