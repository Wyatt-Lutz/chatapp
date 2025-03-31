import { useChatContexts } from "../../hooks/useContexts";
import { initialMemberState } from "../initialState";

export const membersReducer = (state, action) => {
  let newMembers = new Map(state?.members);
  switch(action.type) {
    case "ADD_MEMBER":
      console.log('add member');
      newMembers.set(action.payload.userUid, action.payload.data);
      return { members: newMembers };
    case "UPDATE_MEMBER_DATA":
      const { userUid, data, currUserUid } = action.payload;
      console.log('update member');

      if (userUid === currUserUid) {
        const { chatDispatch, memberDispatch, messageDispatch } = useChatContexts();
        chatDispatch({ type: "RESET" });
        memberDispatch({ type: "RESET" });
        messageDispatch({ type: "RESET" });
        return;
      }

      newMembers.set(userUid, data);
      return { members: newMembers };
    case "RESET":
      return initialMemberState;
    default:
      return state;
  }
}
