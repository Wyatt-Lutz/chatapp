import { initialChatState } from "../initialState";

export const chatReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_CHAT":
      const { chatID, firstMessageID, owner, tempTitle, title, numOfMembers } =
        action.payload;
      return {
        ...state,
        chatID,
        title,
        owner,
        tempTitle,
        firstMessageID,
        numOfMembers,
      };
    case "UPDATE_TITLE":
      return { ...state, title: action.payload };
    case "UPDATE_TEMP_TITLE":
      return { ...state, tempTitle: action.payload };
    case "UPDATE_OWNER":
      return { ...state, owner: action.payload };
    case "UPDATE_MEMBER_UIDS":
      return { ...state };
    case "UPDATE_FIRST_MESSAGE_ID":
      return { ...state, firstMessageID: action.payload };
    case "UPDATE_NUM_OF_MEMBERS":
      return { ...state, numOfMembers: action.payload };
    case "RESET":
      return initialChatState;
    default:
      return state;
  }
};
