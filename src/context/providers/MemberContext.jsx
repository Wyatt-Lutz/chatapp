import { createContext, useContext, useEffect, useReducer } from "react";
import { initialMemberState } from "../initialState";
import { membersReducer } from "../reducers/membersReducer";
import { useAuth } from "./AuthContext";
import { ChatContext, ResetChatContext } from "./ChatContext";
import { MemberListenerService } from "../listenerServices/memberListenerService";


export const MemberContext = createContext();



export const MemberContextProvider = ({ children }) => {
  const [memberState, memberDispatch] = useReducer(membersReducer, initialMemberState);
  const { isReset, setIsReset } = useContext(ResetChatContext);
  const { chatState, resetAllChatContexts } = useContext(ChatContext);

  const { currUser } = useAuth();


  const currUserUid = currUser?.uid;
  const chatID = chatState.chatID;


  useEffect(() => {
    if (!chatID) return;

    if (isReset) {
      setIsReset(!isReset);
      memberDispatch({ type: "RESET" });
    }

    const unsubscribe = MemberListenerService.setUpMemberListeners(chatID, currUserUid, {
      onMemberAdded: (userUid, memberData) => {
        memberDispatch({ type:"ADD_MEMBER", payload: { userUid, data: memberData }});
      },

      onMemberUpdated: (userUid, memberData, currUserUid) => {
        memberDispatch({ type: "UPDATE_MEMBER_DATA", payload: { userUid, data: memberData, currUserUid, resetChatContexts: () => resetAllChatContexts() }});
      }
    })



    return unsubscribe;
  }, [chatID, currUserUid, isReset, resetAllChatContexts]);



  return (
    <MemberContext.Provider value={{ memberState, memberDispatch }}>
      {children}
    </MemberContext.Provider>
  );
};
