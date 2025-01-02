import { createContext, useContext, useEffect, useReducer } from "react";
import { limitToLast, orderByChild, query, startAt, ref, onChildAdded, onChildChanged, onChildRemoved } from "firebase/database";
import { getBlockData } from "../services/memberDataService";
import { AuthContext } from "./AuthProvider";
import { db } from "../../firebase";


export const ChatContext = createContext();

const initialState = {
  chatData: {
    chatID: null,
    title: '',
    tempTitle: '',
    owner: '',
  },
  memberData: new Map(),
  messagesData: {
    messages: new Map(),
    endTimestamp: 0,
    numUnread: 0,
    isAtBottom: true,
  }

};


const chatReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_CHAT":
      //dispatch({type: "UPDATE_CHATROOM", payload: state});
      return {
        ...state,
        chatID: action.payload.chatID,
        title: action.payload.title,
        owner: action.payload.owner,
        tempTitle: action.payload.tempTitle,
      };
    case "UPDATE_TITLE":
      return { ...state, title: action.payload };
    case "UPDATE_TEMP_TITLE":
      return { ...state, tempTitle: action.payload };
    case "UPDATE_OWNER":
      return {...state, owner: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};


const membersReducer = (state, action) => {
  let newMembers = new Map(state.members);
  switch(action.type) {
    case "ADD_MEMBER":
    case "UPDATE_MEMBER_DATA":
      newMembers.set(action.payload.key, action.payload.data);
      return { ...state, members: newMembers };
    case "REMOVE_MEMBER":
      newMembers.delete(action.payload);
      return { ...state, members: newMembers };
    default:
      return state;
  }
}


const messagesReducer = (state, action) => {
  let newMessages = new Map(state.members);
  switch (action.type) {
    case "ADD_MESSAGE":
    case "EDIT_MESSAGE":
      newMessages.set(action.payload.key, action.payload.data);
      return { ...state, messages: newMessages };

    case "ADD_OLDER_MESSAGES":
      return {
        ...state,
        messages: new Map([...state.messages, ...action.payload]),
      }

    case "REMOVE_MESSAGE":
      newMessages.delete(action.payload);
      return { ...state, messages: newMessages };

    case "UPDATE_END_TIMESTAMP":
      return { ...state, endTimestamp: action.payload };

    case "UPDATE_IS_AT_BOTTOM":
      return { ...state, isAtBottom: action.payload };

    case "UPDATE_UNREAD":
      return {  ...state, numUnread: action.payload };

    default:
      return state;

  }
}

const rootReducer = (state, action) => ({
  chat: chatReducer(state.chat, action),
  members: membersReducer(state.members, action),
  messages: messagesReducer(state.messages, action),
});

export const ChatContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);
  const { currUser } = useContext(AuthContext);


  const chatID = state.chatData.chatID;
  const members = state.memberData.members;
  const messages = state.messagesData.messages;
  const endTimestamp = state.messagesData.endTimestamp;
  const numUnread = state.messagesData.numUnread;
  const isAtBottom = state.messagesData.isAtBottom;



  //Chatroom metadata Listeners useEffect
  useEffect(() => {
    if (!chatID) return;
    const onChatroomEdited = (snap) => {
      console.log("key" + snap.key);
      console.log("val" + snap.val());
    }

    const chatroomRef = ref(db, `chats/${chatID}`);
    const chatRoomEditedListener = onChildChanged(chatroomRef, onChatroomEdited);

    return () => {
      chatRoomEditedListener();
    }
  }, [chatID]);




  //Members data Listeners UseEffect
  useEffect(() => {
    if (!chatID) return;
    const membersRef = ref(db, `members/${chatID}`);

    const handleMemberAdded = async(snap) => {
      console.log("handleMemberAdded: " + snap.val().username);
      const userBlockData = await getBlockData(db, currUser.uid);
      console.log(userBlockData);
      const memberObj = {...snap.val(), isBlocked: userBlockData[snap.key]};
      dispatch({type:"ADD_MEMBER", payload: {key: snap.key, data: memberObj }});
    }

    const handleMemberRemoved = (snap) => {
      dispatch({type: "REMOVE_MEMBER", payload: snap.key});
    }

    const handleUpdateMember = (snap) => {

      const member = members.get(snap.key);
      if (!member) return;
      const data = snap.val();

      for (const property in data) {
        member[property] = data[property];
      }

      dispatch({type: "UPDATE_MEMBER_DATA", payload: {key: snap.key, data: member}});
    }


    const memberAddedListener = onChildAdded(membersRef, handleMemberAdded);
    const memberUpdatedListener = onChildChanged(membersRef, handleUpdateMember);
    const memberRemovedListener = onChildRemoved(membersRef, handleMemberRemoved);



    return () => {
      memberAddedListener();
      memberRemovedListener();
      memberUpdatedListener();
    }
  }, [chatID, currUser.uid, members]);




  //Messages data Listeners useEffect
  useEffect(() => {
    if (!chatID) return;

    const handleMessageAdded = (snap) => {
      console.log("key:" + snap.key);
      console.log("data:" + snap.val());
      if (messages.size === 0) {
        dispatch({type: "UPDATE_END_TIMESTAMP", payload: snap.val().timestamp});
      }

      if (!isAtBottom) {
        dispatch({type: "UPDATE_UNREAD", payload: (numUnread + 1)});
      }

      dispatch({type: "ADD_MESSAGE", payload: {key: snap.key, data: snap.val()}});
    }

    const handleMessageEdited = (snap) => {
      const message = messages.get(snap.key);
      if (!message) return;
      const data = snap.val();

      for (const property in data) {
        message[property] = data[property];
      }

      dispatch({type: "EDIT_MESSAGE", payload: {key: snap.key, data: message}});
    }

    const handleMessageDeleted = (snap) => {
      dispatch({type: "REMOVE_MESSAGE", payload: snap.key});
    }

    const chatsRef = ref(db, `messages/${chatID}/`);
    const endTimestamp = endTimestamp;
    const addedListenerQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp), limitToLast(10));
    const otherListenersQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp));


    const chatAddedListener = onChildAdded(addedListenerQuery, handleMessageAdded);
    const chatChangedListener = onChildChanged(otherListenersQuery, handleMessageEdited);
    const chatRemovedListener = onChildRemoved(otherListenersQuery, handleMessageDeleted);

    return () => {
      chatAddedListener();
      chatChangedListener();
      chatRemovedListener();
    };
  }, [chatID, endTimestamp, numUnread, isAtBottom, messages]);










  return (
    <ChatContext.Provider value={{ currChat: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
