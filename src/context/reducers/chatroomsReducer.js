import { initialChatroomState } from "../initialState";

export const chatroomReducer = (state, action) => {
  let newChatrooms = new Map(state?.chatrooms);
  switch (action.type) {
    case "ADD_CHATROOM":
      newChatrooms.set(action.payload.key, action.payload.data);
      return { chatrooms: newChatrooms };
    case "UPDATE_TEMP_TITLE":
      newChatrooms.set(action.payload.key, {
        ...newChatrooms.get(action.payload.key),
        tempTitle: action.payload.data,
      });
      return { chatrooms: newChatrooms };
    case "UPDATE_TITLE":
      newChatrooms.set(action.payload.key, {
        ...newChatrooms.get(action.payload.key),
        title: action.payload.data,
      });
      return { chatrooms: newChatrooms };
    case "UPDATE_MEMBER_UIDS":
      newChatrooms.set(action.payload.key, {
        ...newChatrooms.get(action.payload.key),
        memberUids: action.payload.data,
      });
      return { chatrooms: newChatrooms };
    case "UPDATE_UNREAD_COUNT":
      newChatrooms.set(action.payload.key, {
        ...newChatrooms.get(action.payload.key),
        numUnread: action.payload.data,
      });
      return { chatrooms: newChatrooms };
    case "REMOVE_CHATROOM":
      newChatrooms.delete(action.payload);
      return { chatrooms: newChatrooms };
    case "RESET":
      return initialChatroomState;
    default:
      return state;
  }
};
