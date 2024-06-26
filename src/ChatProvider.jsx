import { createContext, useReducer, useEffect, useContext } from "react";
import { ref, onChildChanged, onChildAdded, update, get} from 'firebase/database';
import { db } from "../firebase";
import { AuthContext } from "./AuthProvider";


export const ChatContext = createContext();
export const ChatContextProvider = ({ children }) => {
  const { currUser } = useContext(AuthContext);
  const initialState = {
    chatID: null,
    title: '',
    members: [],
    owner: '',
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_CHAT":
        return {
          ...state,
          chatID: action.payload.chatID,
          title: action.payload.title,
          owner: action.payload.owner,
        };
      case "UPDATE_TITLE":
        return {
          ...state,
          title: action.payload,
        };
      case "UPDATE_OWNER":
        return {
          ...state,
          owner: action.payload,
        }
      case "ADD_MEMBER":
        return {
          ...state,
          members: [
            ...state.members,
            action.payload,
          ]
        };

      case "CHANGE_MEMBER":
        console.log('changed member');
        const newTitle = handleChangeMember(state, action);

        if (newTitle !== "") {

          return {
            ...state,
            title: newTitle,
            members: [
              ...newMembers,
            ]
          };
        }

        return {
          ...state,
          members: [
            ...newMembers,
          ]
        };
      case "RESET":
        console.log('reset context')
        return initialState;

      default:
        return state;
    }
  };

  const handleChangeMember = async(state, action) => {

    const newMembers = [...state.members]
    newMembers.map(((member, index) => {
      if (member.uid === action.payload.uid) {
        newMembers[index] = action.payload;
      }
    }));
    const chatsRef = ref(db, "chats/" + state.chatID);
    const chatsSnap = await get(chatsRef);
    console.log(chatsSnap.val());

    if (chatsSnap.val().title === "") {
      const newTitle = newMembers.filter(member => member.username !== currUser.displayName).map(member => member.username).join(', ');
      return newTitle;


    }
    return "";
  }
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    console.log(state.chatID)
    if (!state.chatID) {
      return;
    }
    const chatsRef = ref(db, "chats/" + state.chatID);
    const memberRef = ref(db, "members/" + state.chatID);


    const chatsChangeListener = onChildChanged(chatsRef, (snap) => {
      if (snap.val().title) {
        dispatch({type: "UPDATE_TITLE", payload: snap.val().title});
      } else {
        dispatch({type: "UPDATE_OWNER", payload: snap.val().owner});
      }
    });

    const memberAddedListener = onChildAdded(memberRef, (snap) => {
      dispatch({type: "ADD_MEMBER", payload: { uid: snap.key, isOnline: snap.val().isOnline, hasBeenRemoved: snap.val().hasBeenRemoved || false, username: snap.val().username }});
    });

    const memberChangedListener = onChildChanged(memberRef, (snap) => {

      dispatch({type: "CHANGE_MEMBER", payload: { uid: snap.key, isOnline: snap.val().isOnline, hasBeenRemoved: snap.val().hasBeenRemoved || false, username: snap.val().username }});
    })



    return () => {
      chatsChangeListener();
      memberAddedListener();
      memberChangedListener();
    }
  }, [state.chatID]);
  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
