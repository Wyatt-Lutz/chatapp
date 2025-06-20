import { initialMessageState } from "../initialState";

export const messagesReducer = (state, action) => {
  let newMessages = new Map(state?.messages);
  const { key, data } = action?.payload || {};

  switch (action.type) {
    case "ADD_MESSAGE":
      const isFirstMessage = state.messages.size === 0;
      let numUnread = state.numUnread;

      if (!state.isAtBottom) {
        numUnread = numUnread + 1;
      }

      newMessages.set(key, data);
      return {
        ...state,
        messages: newMessages,
        numUnread,
        endTimestamp: isFirstMessage
          ? action.payload.data.timestamp
          : state.endTimestamp,
      };

    case "EDIT_MESSAGE":
      const currMessage = newMessages.get(key);
      newMessages.set(key, { ...currMessage, ...data });
      return { ...state, messages: newMessages };

    case "ADD_OLDER_MESSAGES":
      const combinedMessages = new Map([...action.payload, ...state.messages]);
      return {
        ...state,
        messages: combinedMessages,
      };

    case "REMOVE_MESSAGE":
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
