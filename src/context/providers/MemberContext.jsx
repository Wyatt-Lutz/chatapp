import { createContext, useContext, useEffect, useReducer } from "react";
import { ref, onChildAdded, onChildChanged, onChildRemoved } from "firebase/database";
import { getBlockData } from "../../services/memberDataService";
import { AuthContext } from "./AuthContext";
import { db } from "../../../firebase";
import { initialMemberState } from "../initialState";
import { membersReducer } from "../reducers/membersReducer";
import { ChatContext } from "./ChatContext";


export const MemberContext = createContext();



export const MemberContextProvider = ({ children }) => {
  const [memberState, memberDispatch] = useReducer(membersReducer, initialMemberState);
  const { chatState } = useContext(ChatContext);

  const { currUser } = useContext(AuthContext);
  const currUserUid = currUser?.uid;


  const chatID = chatState.chatID;
  const members = memberState.members;



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
      console.log(snap.key);


      memberDispatch({type: "REMOVE_MEMBER", payload: snap.key});
    }

    const handleUpdateMember = (snap) => {
      console.log(snap.key);
      if (!members) return;
      const member = members.get(snap.key);
      if (!member) return;
      const data = snap.val();
      console.log(data);
      console.log(member);

      if ((member.username !== data.username) && (snap.key !== currUser.uid)) {
        console.log('will update temp title');
        const tempTitle = chatState.tempTitle.split(', ').filter((name) => name !== member.username).concat(data.username);
        chatDispatch({ type: "UPDATE_TEMP_TITLE", payload: tempTitle});
      } else if (member.isOnline !== data.isOnline) {
        member.isOnline = data.isOnline;
      } else if (member.hasBeenRemoved !== data.hasBeenRemoved) {
        member.hasBeenRemoved = data.hasBeenRemoved;
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



  return (
    <MemberContext.Provider value={{ memberState, memberDispatch }}>
      {children}
    </MemberContext.Provider>
  );
};
