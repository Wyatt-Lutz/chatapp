import { createContext, useReducer } from "react";
import { chatroomReducer } from "../reducers/chatroomsReducer";
import { initialChatroomState } from "../initialState";

export const ChatroomsContext = createContext();

export const ChatroomsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatroomReducer, initialChatroomState);

  return (
    <ChatroomsContext.Provider
      value={{ chatroomsState: state, chatroomsDispatch: dispatch }}
    >
      {children}
    </ChatroomsContext.Provider>
  );
};
