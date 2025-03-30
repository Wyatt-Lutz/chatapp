import { initialMemberState } from "../initialState";

export const membersReducer = (state, action) => {
  let newMembers = new Map(state?.members);
  switch(action.type) {
    case "ADD_MEMBER":
      console.log('add member');
      newMembers.set(action.payload.userUid, action.payload.data);
      return { members: newMembers };
    case "UPDATE_MEMBER_DATA":
      const { userUid, data, currUserUid, updateTempTitle } = action.payload;
      console.log(data);
      const member = newMembers.get(userUid);

      if (member && (member.username !== data.username) && (userUid !== currUserUid)) {
        updateTempTitle(member.username, data.username);
      }
      console.log('update member');
      console.log(action.payload.key);
      console.log(action.payload.data);
      console.log(newMembers);
      newMembers.set(userUid, data);
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
