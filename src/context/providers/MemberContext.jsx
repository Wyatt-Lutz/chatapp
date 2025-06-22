import { createContext, useContext, useEffect, useReducer } from "react";
import { initialMemberState } from "../initialState";
import { membersReducer } from "../reducers/membersReducer";
import { useAuth } from "./AuthContext";
import { MemberListenerService } from "../listenerServices/memberListenerService";
import { ChatContext } from "./ChatContext";

export const MemberContext = createContext();

export const MemberContextProvider = ({ children }) => {
  const [memberState, memberDispatch] = useReducer(
    membersReducer,
    initialMemberState,
  );
  const { currUser } = useAuth();
  const { chatState } = useContext(ChatContext);

  const currUserUid = currUser?.uid;
  const chatID = chatState.chatID;

  useEffect(() => {
    if (!chatID) return;

    const unsubscribe = MemberListenerService.setUpMemberListeners(
      chatID,
      currUserUid,
      {
        onMemberAdded: (uid, memberData) => {
          memberDispatch({
            type: "ADD_MEMBER",
            payload: { uid, data: memberData },
          });
        },

        onMemberUpdated: (uid, memberData) => {
          memberDispatch({
            type: "UPDATE_MEMBER_DATA",
            payload: { uid, data: memberData },
          });
        },
      },
    );

    return unsubscribe;
  }, [chatID, currUserUid]);

  return (
    <MemberContext.Provider value={{ memberState, memberDispatch }}>
      {children}
    </MemberContext.Provider>
  );
};
