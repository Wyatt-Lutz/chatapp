import { initialMemberState } from "../initialState";

export const membersReducer = (state, action) => {
  let newMembers = new Map(state?.members);
  switch(action.type) {
    case "ADD_MEMBER":
    case "UPDATE_MEMBER_DATA":
      console.log('add/update member');
      console.log(action.payload.key);
      console.log(action.payload.data);
      console.log(newMembers);
      newMembers.set(action.payload.key, action.payload.data);
      return { members: newMembers };
    case "REMOVE_MEMBER":
      newMembers.delete(action.payload);
      return { members: newMembers };
    case "RESET":
      return initialMemberState;
    default:
      return state;
  }
}
