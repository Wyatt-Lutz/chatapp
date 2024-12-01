import { onChildAdded, onChildChanged, onChildRemoved, ref } from "firebase/database";
import { createContext, useContext, useEffect, useReducer } from "react";
import { db } from "../../firebase";
import { ChatContext } from "./ChatContext";



export const MembersContext = createContext();

const { data } = useContext(ChatContext);

const initialState = {
  members: [],
}

const membersReducer = (state, action) => {
  switch(action.type) {
    case "ADD_MEMBER":
      return {
        ...state,
        members: [...state.members, action.payload],
      };
    case "REMOVE_MEMBER":
      return {
        ...state,
        members: state.members.filter(member => member.uid !== action.payload),
      };
    case "UPDATE_MEMBER_DATA":
      return {
        ...state,
        members: [...state.members, action.payload],
      };

    default:
      return state;
  }

}

export const MembersContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(membersReducer, initialState);
  const membersRef = ref(db, `members/${data.chatID}`);

  const handleMemberAdded = (snap) => {
    dispatch({type:"ADD_MEMBER", payload: {[snap.key]: snap.val()}});
  }

  const handleMemberRemoved = (snap) => {
    dispatch({type: "REMOVE_MEMBER", payload: snap.key});
  }

  const handleUpdateMember = (snap) => {
    dispatch({type: "UPDATE_MEMBER_DATA", payload: {[snap.key]: snap.val()}});
  }


  useEffect(() => {
    const memberAddedListener = onChildAdded(membersRef, handleMemberAdded);
    const memberRemovedListener = onChildRemoved(membersRef, handleMemberRemoved);

    const memberUpdatedListener = onChildChanged(membersRef, handleUpdateMember);


    return () => {
      memberAddedListener();
      memberRemovedListener();
      memberUpdatedListener();
    }
  }, [data.chatID]);







  return(
    <MembersContext.Provider value={{ data: state, dispatch }}>
      {children}
    </MembersContext.Provider>
  )
}