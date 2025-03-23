
export const initialChatroomState = { chatrooms: new Map() };


export const initialChatState = {
  chatID: null,
  title: '',
  tempTitle: '',
  owner: '',
  firstMessageID: "",
  numOfMembers: null,
};


export const initialMemberState = { members: new Map() };


export const initialMessageState = {
  messages: new Map(),
  endTimestamp: 0,
  numUnread: 0,
  isAtBottom: true,
  isFirstMessageRendered: false,
}
