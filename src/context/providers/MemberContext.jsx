import { createContext, useContext, useEffect, useReducer } from "react";
import { ref, onChildAdded, onChildChanged, onChildRemoved } from "firebase/database";
import { getBlockData } from "../../services/memberDataService";
import { db } from "../../../firebase";
import { initialMemberState } from "../initialState";
import { membersReducer } from "../reducers/membersReducer";
import { useAuth } from "./AuthContext";
import { ChatContext } from "./ChatContext";
import { updateTempTitle } from "../../utils/chatroomUtils";


export const MemberContext = createContext();



export const MemberContextProvider = ({ children }) => {
  const [memberState, memberDispatch] = useReducer(membersReducer, initialMemberState);

  const { chatState, chatDispatch } = useContext(ChatContext);

  const { currUser } = useAuth();


  const currUserUid = currUser?.uid;
  const chatID = chatState.chatID;
  const members = memberState.members;



  useEffect(() => {
    if (!chatID) return;
    const membersRef = ref(db, `members/${chatID}`);

    const handleMemberAdded = async(snap) => {
      if (snap.val().hasBeenRemoved) return;
      console.log("handleMemberAdded: " + snap.val().username);
      const userBlockData = await getBlockData(db, currUserUid);
      const memberObj = {...snap.val(), isBlocked: userBlockData[snap.key]};
      memberDispatch({type:"ADD_MEMBER", payload: { userUid: snap.key, data: memberObj }});
    }

    const handleMemberRemoved = (snap) => {
      console.log(snap.key);


      memberDispatch({type: "REMOVE_MEMBER", payload: snap.key});
    }

    const handleUpdateMember = (snap) => {
      memberDispatch({
        type: "UPDATE_MEMBER_DATA",
        payload: {
          userUid: snap.key, //userUid
          data: snap.val(), //updated data
          currUserUid: currUser.uid,
          updateTempTitle: (oldUsername, newUsername) => {
            const tempTitle = updateTempTitle(chatState.tempTitle, oldUsername, newUsername);
            chatDispatch({ type: "UPDATE_TEMP_TITLE", payload: tempTitle});
          }
        }
      })
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



  return (
    <MemberContext.Provider value={{ memberState, memberDispatch }}>
      {children}
    </MemberContext.Provider>
  );
};
