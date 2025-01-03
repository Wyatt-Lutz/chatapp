import { createContext, useContext, useEffect, useReducer } from "react";
import { limitToLast, orderByChild, query, startAt, ref, onChildAdded, onChildChanged, onChildRemoved } from "firebase/database";
import { getBlockData } from "../services/memberDataService";
import { AuthContext } from "./AuthProvider";
import { db } from "../../firebase";


export const ChatContext = createContext();

const initialChatState = {
  chatID: null,
  title: '',
  tempTitle: '',
  owner: '',
};
const initialMemberState = {members: new Map()};
const initialMessageState = {
  messages: new Map(),
  endTimestamp: 0,
  numUnread: 0,
  isAtBottom: true,
}


const chatReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_CHAT":
      //dispatch({type: "UPDATE_CHATROOM", payload: state});
      console.log('changed');
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
    case "UPDATE_MEMBER_UIDS":
      return {...state};
    case "RESET":
      return initialState;
    default:
      return state;
  }
};


const membersReducer = (state, action) => {
  let newMembers = new Map(state?.members);
  switch(action.type) {
    case "ADD_MEMBER":
    case "UPDATE_MEMBER_DATA":
      console.log('add/update member');
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
  let newMessages = new Map(state?.messages);
  switch (action.type) {
    case "ADD_MESSAGE":
    case "EDIT_MESSAGE":
      console.log('add message or edit message');
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

export const ChatContextProvider = ({ children }) => {
  const [chatState, chatDispatch] = useReducer(chatReducer, initialChatState);
  const [memberState, memberDispatch] = useReducer(membersReducer, initialMemberState);
  const [messageState, messageDispatch] = useReducer(messagesReducer, initialMessageState);

  const { currUser } = useContext(AuthContext);
  const currUserUid = currUser?.uid;


  const chatID = chatState.chatID;
  const members = memberState.members;
  const messages = messageState.messages;
  const endTimestamp = messageState.endTimestamp;
  const numUnread = messageState.numUnread;
  const isAtBottom = messageState.isAtBottom;



  //Chatroom metadata Listeners useEffect
  useEffect(() => {
    if (!chatID) return;

    const onChatroomEdited = (snap) => {
      const prop = snap.key; //property name

      prop === 'title'
      ? chatDispatch({ type: "UPDATE_TITLE", payload: snap.val() })
      : prop === 'owner'
      ? chatDispatch({ type: "UPDATE_OWNER", payload: snap.val() })
      : prop === 'tempTitle'
      ? chatDispatch({ type: "UPDATE_TEMP_TITLE", payload: snap.val() })
      : prop === 'memberUids'
      ? chatDispatch({ type: "UPDATE_MEMBER_UIDS", payload: snap.val() })
      : null;
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
      const userBlockData = await getBlockData(db, currUserUid);
      const memberObj = {...snap.val(), isBlocked: userBlockData[snap.key]};
      memberDispatch({type:"ADD_MEMBER", payload: {key: snap.key, data: memberObj }});
    }

    const handleMemberRemoved = (snap) => {
      memberDispatch({type: "REMOVE_MEMBER", payload: snap.key});
    }

    const handleUpdateMember = (snap) => {
      if (!members) return;
      const member = members.get(snap.key);
      if (!member) return;
      const data = snap.val();

      for (const property in data) {
        member[property] = data[property];
      }

      memberDispatch({type: "UPDATE_MEMBER_DATA", payload: {key: snap.key, data: member}});
    }


    const memberAddedListener = onChildAdded(membersRef, handleMemberAdded);
    const memberUpdatedListener = onChildChanged(membersRef, handleUpdateMember);
    const memberRemovedListener = onChildRemoved(membersRef, handleMemberRemoved);



    return () => {
      memberAddedListener();
      memberRemovedListener();
      memberUpdatedListener();
    }
  }, [chatID, currUserUid]);




  //Messages data Listeners useEffect
  useEffect(() => {
    if (!chatID) return;

    const handleMessageAdded = (snap) => {
      if (messages.size === 0) {
        messageDispatch({type: "UPDATE_END_TIMESTAMP", payload: snap.val().timestamp});
      }

      if (!isAtBottom) {
        messageDispatch({type: "UPDATE_UNREAD", payload: (numUnread + 1)});
      }

      messageDispatch({type: "ADD_MESSAGE", payload: {key: snap.key, data: snap.val()}});
    }

    const handleMessageEdited = (snap) => {
      const message = messages.get(snap.key);
      if (!message) return;
      const data = snap.val();

      for (const property in data) {
        message[property] = data[property];
      }

      messageDispatch({type: "EDIT_MESSAGE", payload: {key: snap.key, data: message}});
    }

    const handleMessageDeleted = (snap) => {
      messageDispatch({type: "REMOVE_MESSAGE", payload: snap.key});
    }

    const chatsRef = ref(db, `messages/${chatID}/`);
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
  }, [chatID, endTimestamp, numUnread, isAtBottom]);


  return (
    <ChatContext.Provider value={{ chatState, memberState, messageState, chatDispatch, memberDispatch, messageDispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
