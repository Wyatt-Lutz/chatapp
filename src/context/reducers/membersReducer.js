import { initialMemberState } from "../initialState";

export const membersReducer = (state, action) => {
  let newMembers = new Map(state?.members);
  switch(action.type) {
    case "ADD_MEMBER":
    case "UPDATE_MEMBER_DATA":
      const { userUid, data } = action.payload;

      newMembers.set(userUid, data);
      return { members: newMembers };
    case "RESET":
      return initialMemberState;
    default:
      return state;
  }
}
