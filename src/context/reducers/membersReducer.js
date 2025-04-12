import { initialMemberState } from "../initialState";

export const membersReducer = (state, action) => {
  let newMembers = new Map(state?.members);
  switch(action.type) {
    case "ADD_MEMBER":
      console.log('add member');
      newMembers.set(action.payload.userUid, action.payload.data);
      return { members: newMembers };
    case "UPDATE_MEMBER_DATA":
      const { userUid, data, currUserUid, resetChatContexts } = action.payload;
      console.log('update member');

      console.log(currUserUid)
      if ((currUserUid === userUid) && state.members.get(currUserUid) && (data.hasBeenRemoved !== state.members.get(currUserUid).hasBeenRemoved)) {
        console.log('hi there');
        resetChatContexts();
      }

      newMembers.set(userUid, data);
      return { members: newMembers };
    case "RESET":
      return initialMemberState;
    default:
      return state;
  }
}
