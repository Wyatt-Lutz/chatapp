import { createContext, useContext, useEffect, useReducer } from "react";
import { ref, onChildAdded, onChildChanged } from "firebase/database";
import { getBlockData } from "../../services/memberDataService";
import { db } from "../../../firebase";
import { initialMemberState } from "../initialState";
import { membersReducer } from "../reducers/membersReducer";
import { useAuth } from "./AuthContext";
import { ChatContext } from "./ChatContext";


export const MemberContext = createContext();



export const MemberContextProvider = ({ children }) => {
  const [memberState, memberDispatch] = useReducer(membersReducer, initialMemberState);

  const { chatState } = useContext(ChatContext);

  const { currUser } = useAuth();


  const currUserUid = currUser?.uid;
  const chatID = chatState.chatID;


  useEffect(() => {
    if (!chatID) return;
    const membersRef = ref(db, `members/${chatID}`);

    const handleMemberAdded = async(snap) => {
      console.log("handleMemberAdded: " + snap.val().username);
      const userBlockData = await getBlockData(db, currUserUid);
      const memberObj = {...snap.val(), isBlocked: userBlockData[snap.key]};
      memberDispatch({type:"ADD_MEMBER", payload: { userUid: snap.key, data: memberObj }});
    }


    const handleUpdateMember = (snap) => {
      memberDispatch({ type: "UPDATE_MEMBER_DATA", payload: { userUid: snap.key, data: snap.val(), currUserUid: currUser.uid }});
    }

    const memberAddedListener = onChildAdded(membersRef, handleMemberAdded);
    const memberUpdatedListener = onChildChanged(membersRef, handleUpdateMember);



    return () => {
      memberAddedListener();
      memberUpdatedListener();
    }
  }, [chatID, currUserUid]);



  return (
    <MemberContext.Provider value={{ memberState, memberDispatch }}>
      {children}
    </MemberContext.Provider>
  );
};
