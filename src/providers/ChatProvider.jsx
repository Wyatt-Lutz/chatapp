import { createContext, useReducer, useEffect, useContext } from "react";
import { ref, onChildChanged, onChildAdded, update, get} from 'firebase/database';
import { db } from "../../firebase";
import { AuthContext } from "./AuthProvider";


export const ChatContext = createContext();

const initialState = {
  chatrooms: [],
  chatID: null,
  title: '',
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
        members: [],
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
      const newMembers = handleChangeMember(state, action);
      handleChangeTitle(state, newMembers);


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

export const ChatContextProvider = ({ children }) => {
  const { currUser } = useContext(AuthContext);
/*
  const handleNewChatAdded = useCallback(async(snap) => {

    const newChatID = snap.key;
    const chatsRef = ref(db, "chats/" + newChatID);
    const newChatSnap = await get(chatsRef);
    const newChatData = newChatSnap.val();


    // If creater of chat didn't set a title, create a title for the client based off the members usernames




    newChatData.id = newChatID;
    setChatsData(prev => ({
      chats: [...prev.chats, newChatData],
      numUnread: {
        ...prev.numUnread,
        [newChatID]: snap.val(),
      }
    }));
    setIsLoadingChats(false);

  });


  useEffect(() => {

    const childAddedListener = onChildAdded(chatsInRef, handleNewChatAdded);
    const childChangedListener = onChildChanged(chatsInRef, handleUpdateUnread);
    const childRemovedListener = onChildRemoved(chatsInRef, handleChildRemoved);


    return () => {
      childAddedListener();
      childChangedListener();
      childRemovedListener();
    }
  })
*/
  
  const handleChangeMember = (state, action) => {
    const newMembers = [...state.members]
    newMembers.map(((member, index) => {
      if (member.uid === action.payload.uid) {
        newMembers[index] = action.payload;

      }
    }));
    return newMembers;
  }

  const handleChangeTitle = (state, newMembers) => async (dispatch) => {
    const chatsRef = ref(db, "chats/" + state.chatID);
    const chatsSnap = await get(chatsRef);
    let newTitle = "";

    if (chatsSnap.val().title === "") {
      newTitle = newMembers.filter(member => member.username !== currUser.displayName).map(member => member.username).join(', ');
    }

    dispatch({type: "UPDATE_TITLE", payload: newTitle});
  }


  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
