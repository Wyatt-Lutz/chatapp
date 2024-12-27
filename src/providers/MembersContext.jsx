import { onChildAdded, onChildChanged, onChildRemoved, ref } from "firebase/database";
import { createContext, useContext, useEffect, useReducer } from "react";
import { db } from "../../firebase";
import { getBlockData } from "../services/memberDataService";
import { AuthContext } from "./AuthProvider";
import { ChatContext } from "./ChatContext";

export const MembersContext = createContext();

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
        members: delete state.members.action.payload,
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
  const { chatRoomData } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);

  useEffect(() => {
    if (!chatRoomData.chatID) return;

    const membersRef = ref(db, `members/${chatRoomData.chatID}`);

    const handleMemberAdded = async(snap) => {
      const userBlockData = await getBlockData(db, currUser.uid);
      const memberObj = {[snap.key]: {...snap.val(), isBlocked: userBlockData[snap.key]}};
      dispatch({type:"ADD_MEMBER", payload: memberObj});
    }
  
    const handleMemberRemoved = (snap) => {
      dispatch({type: "REMOVE_MEMBER", payload: snap.key});
    }
  
    const handleUpdateMember = (snap) => {
      dispatch({type: "UPDATE_MEMBER_DATA", payload: {[snap.key]: snap.val()}});
    }


    
    const memberAddedListener = onChildAdded(membersRef, handleMemberAdded);
    const memberRemovedListener = onChildRemoved(membersRef, handleMemberRemoved);
    const memberUpdatedListener = onChildChanged(membersRef, handleUpdateMember);


    return () => {
      memberAddedListener();
      memberRemovedListener();
      memberUpdatedListener();
    }
  }, [chatRoomData.chatID]);


  return(
    <MembersContext.Provider value={{ memberData: state, dispatch }}>
      {children}
    </MembersContext.Provider>
  )
}