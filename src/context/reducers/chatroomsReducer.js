import { initialChatroomState } from "../initialState";

const updatePropNameMap = {
  UPDATE_TEMP_TITLE: "tempTitle",
  UPDATE_TITLE: "title",
  UPDATE_MEMBER_UIDS: "memberUids",
  UPDATE_UNREAD_COUNT: "numUnread",
  UPDATE_LAST_MESSAGE_TIMESTAMP: "lastMessageTimestamp",
};

export const chatroomReducer = (state, action) => {
  let newChatrooms = new Map(state?.chatrooms);

  const updateProp = (prop, key, data) => {
    const chatroom = newChatrooms.get(key);
    if (!chatroom) return;
    newChatrooms.set(key, { ...chatroom, [prop]: data });
  };

  switch (action.type) {
    case "ADD_CHATROOM":
      newChatrooms.set(action.payload.key, action.payload.data);
      break;
    case "REMOVE_CHATROOM":
      newChatrooms.delete(action.payload);
      break;

    case "UPDATE_TEMP_TITLE":
    case "UPDATE_TITLE":
    case "UPDATE_MEMBER_UIDS":
    case "UPDATE_UNREAD_COUNT":
    case "UPDATE_LAST_MESSAGE_TIMESTAMP":
      updateProp(
        updatePropNameMap[action.type],
        action.payload.key,
        action.payload.data,
      );
      break;

    case "RESET":
      return initialChatroomState;
    default:
      return state;
  }
  return { chatrooms: newChatrooms };
};
