import { initialMessageState } from "../initialState";

export const messagesReducer = (state, action) => {
  const { type, payload } = action;
  const { key, data } = payload || {};
  let newMessages = new Map(state?.messages);

  switch (type) {
    case "ADD_MESSAGE":
      const isFirstMessage = state.messages.size === 0;

      const numUnread = state.isAtBottom
        ? state.numUnread
        : state.numUnread + 1;

      newMessages.set(key, data);

      return {
        ...state,
        messages: newMessages,
        numUnread,
        endTimestamp: isFirstMessage ? data.timestamp : state.endTimestamp,
      };

    case "EDIT_MESSAGE":
      const currMessage = newMessages.get(key);
      if (!currMessage) return state;
      newMessages.set(key, { ...currMessage, ...data });
      return { ...state, messages: newMessages };

    case "ADD_OLDER_MESSAGES":
      const combinedMessages = new Map([...action.payload, ...state.messages]);
      return {
        ...state,
        messages: combinedMessages,
      };

    case "DELETE_MESSAGE":
      newMessages.delete(action.payload);
      return { ...state, messages: newMessages };

    case "UPDATE_END_TIMESTAMP":
      return { ...state, endTimestamp: action.payload };

    case "UPDATE_IS_AT_BOTTOM":
      return { ...state, isAtBottom: action.payload };

    case "UPDATE_UNREAD":
      return { ...state, numUnread: action.payload };

    case "UPDATE_IS_FIRST_MESSAGE_RENDERED":
      return { ...state, isFirstMessageRendered: action.payload };

    case "RESET":
      return initialMessageState;

    default:
      return state;
  }
};
