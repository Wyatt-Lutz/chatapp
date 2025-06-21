import { initialMemberState } from "../initialState";

export const membersReducer = (state, action) => {
  let newMembers = new Map(state?.members);
  switch (action.type) {
    case "ADD_MEMBER":
    case "UPDATE_MEMBER_DATA":
      const { uid, data } = action.payload;
      console.log(action.payload);

      newMembers.set(uid, data);
      return { members: newMembers };
    case "RESET":
      return initialMemberState;
    default:
      return state;
  }
};
