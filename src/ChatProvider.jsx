import { createContext, useReducer, useEffect } from "react";
import { ref, onChildChanged, onChildAdded, update} from 'firebase/database';
import { db } from "../firebase";
export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const initialState = {
    chatID: null,
    title: '',
    members: [],
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_CHAT":
        return {
          ...state,
          chatID: action.payload.chatID,
          title: action.payload.title,
        };
      case "UPDATE_TITLE":
        return {
          ...state,
          title: action.payload,
        };
      case "ADD_MEMBER":
        return {
          ...state,
          members: [
            ...state.members,
            action.payload,
          ]
        };
        /*
      case "CHANGE_MEMBER":
        return{
          ...state,
          members: []
        }
          */

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
    const memberRef = ref(db, "members/" + state.chatID);


    const titleChangeListener = onChildChanged(chatTitleQuery, (snap) => {
      dispatch({type: "UPDATE_TITLE", payload: snap.val()});
    });

    const memberAddedListener = onChildAdded(memberRef, (snap) => {
      dispatch({type: "ADD_MEMBERS", payload: {[snap.key]: snap.val()}});
    });
/*
    const memberChangedListener = onChildChanged(memberRef, (snap) => {
      console.log(snap.val())
      dispatch({type: "CHANGE_MEMBERS", payload: {[snap.key]: snap.val()}});
    })
*/


    return () => {
      titleChangeListener();
      memberAddedListener();
      //memberChangedListener();
    }
  }, [state.chatID]);
  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
