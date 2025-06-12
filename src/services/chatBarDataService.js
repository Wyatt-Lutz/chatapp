import { push, ref, set, update, get } from "firebase/database";
import { fetchChatsInData } from "./memberDataService";

export const createChat = async (
  db,
  memberUids,
  title,
  tempTitle,
  membersList,
  uids,
  numOfMembers,
  currUserUid,
) => {
  try {
    const chatsRef = ref(db, "chats/");
    const newChatRef = push(chatsRef);
    const chatID = newChatRef.key;
    const membersRef = ref(db, `members/${chatID}`);

    const newChatData = {
      title: title,
      tempTitle: tempTitle,
      owner: currUserUid,
      memberUids: memberUids,
      firstMessageID: "",
      numOfMembers: numOfMembers,
    };

    await Promise.all([
      set(newChatRef, newChatData),
      set(membersRef, membersList),

      ...uids.map((uid) => {
        const userChatDataRef = ref(db, `users/${uid}/chatsIn`);
        const chatData = { [chatID]: 0 };
        update(userChatDataRef, chatData);
      }),
    ]);

    console.info("created chat");
    return chatID;
  } catch (error) {
    console.error(error);
  }
};

export const checkIfDuplicateChat = (newChatMemberUids, chatrooms) => {
  for (const chatroom of chatrooms.values()) {
    if (chatroom.memberUids === newChatMemberUids) {
      return true;
    }
  }
  return false;
};

/**
 * Fetches metadata for a specified chatroom.
 * @param {*} db
 * @param {*} chatID
 * @returns
 */
export const fetchChatRoomData = async (db, chatID) => {
  const chatroomRef = ref(db, `chats/${chatID}`);
  const chatroomDataSnap = await get(chatroomRef);
  return chatroomDataSnap.val();
};
