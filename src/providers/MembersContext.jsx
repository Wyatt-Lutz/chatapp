import { onChildAdded, onChildChanged, onChildRemoved, ref } from "firebase/database";
import { createContext, useContext, useEffect, useReducer } from "react";
import { db } from "../../firebase";
import { getBlockData } from "../services/memberDataService";
import { AuthContext } from "./AuthProvider";
import { ChatContext } from "./ChatContext";

export const MembersContext = createContext();

const initialState = {
  members: new Map(),
}

const membersReducer = (state, action) => {
  switch(action.type) {
    case "ADD_MEMBER":
      return {
        ...state,
        members: state.members.set(action.payload.key, action.payload.data),
      };
    case "REMOVE_MEMBER":
      return {
        ...state,
        members: state.members.delete(action.payload),
      };
    case "UPDATE_MEMBER_DATA":
      return {
        ...state,
        members: state.members.set(action.payload.key, action.payload.data),
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
    console.log(chatRoomData.chatID);
    if (!chatRoomData.chatID) return;
    

    const membersRef = ref(db, `members/${chatRoomData.chatID}`);

    const handleMemberAdded = async(snap) => {
      console.log("handleMemberAdded: " + snap.val());
      const userBlockData = await getBlockData(db, currUser.uid);
      console.log(userBlockData);
      const memberObj = {...snap.val(), isBlocked: userBlockData[snap.key]};
      dispatch({type:"ADD_MEMBER", payload: {key: snap.key, data: memberObj }});
    }
  
    const handleMemberRemoved = (snap) => {
      dispatch({type: "REMOVE_MEMBER", payload: snap.key});
    }
  
    const handleUpdateMember = (snap) => {
      
      const member = state.members.get(snap.key);
      if (!member) return;
      for (const prop in snap.val()) {
        if (snap.val().hasOwnProperty(prop)) {
          member[prop] = snap.val()[prop];
        }
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
  }, [chatRoomData.chatID]);


  return(
    <MembersContext.Provider value={{ membersData: state, dispatch }}>
      {children}
    </MembersContext.Provider>
  )
}