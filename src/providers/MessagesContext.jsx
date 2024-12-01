import { createContext, useReducer } from "react";


export const MessagesContext = createContext();

const initialState = {
  messages: [],
};

const messagesReducer = (state, action) => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {

      };
      default:
        return state;

  }
}


export const MessagesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messagesReducer, initialState);

  return (
    <MessagesContext.Provider value={{ data: state, dispatch }}>
      { children }
    </MessagesContext.Provider>
  )
}

