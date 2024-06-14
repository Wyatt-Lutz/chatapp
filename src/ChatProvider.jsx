import { createContext, useReducer, useEffect } from "react";
import { ref, onChildChanged} from 'firebase/database';
import { db } from "../firebase";
export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const initialState = {
    chatID: null,
    title: '',
    user: {},
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_CHAT":
        return {
          chatID: action.payload.chatID,
          title: action.payload.title,
        };
      case "UPDATE_TITLE":
        return {
          ...state,
          title: action.payload,
        }

      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    if (!state.chatID) {
      return;
    }
    const chatTitleQuery = ref(db, "chats/" + state.chatID + "/metadata");
    const titleChangeListener = onChildChanged(chatTitleQuery, (snap) => {
      dispatch({type: "UPDATE_TITLE", payload: snap.val()});
    });

    return () => titleChangeListener();
  }, [state.chatID]);
  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
