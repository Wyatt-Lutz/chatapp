import { onChildChanged, ref } from "firebase/database";
import { db } from "../../../firebase";

export const ChatListenerService = {
  setUpChatListeners(chatID, action) {
    if (!chatID) {
      return;
    }

    const propHandler = {
      title: action.onTitleChanged,
      tempTitle: action.onTempTitleChanged,
      owner: action.onOwnerChanged,
      firstMessageID: action.onFirstMessageIDChanged,
      memberUids: action.onMemberUidsChanged,
      numOfMembers: action.onNumOfMembersChanged,
    };

    const handleChatroomChanged = async (snap) => {
      const prop = snap.key;
      const handler = propHandler[prop];
      if (handler) {
        handler(snap.val());
      }
    };

    const chatroomRef = ref(db, `chats/${chatID}`);
    const unsubscribe = onChildChanged(chatroomRef, handleChatroomChanged);
    return unsubscribe;
  },
};
