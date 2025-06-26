import {
  push,
  ref,
  set,
  update,
  get,
  serverTimestamp,
} from "firebase/database";

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
      lastMessageTimestamp: serverTimestamp(),
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
  return [...chatrooms.values()].some(
    (chatroom) => chatroom.memberUids === newChatMemberUids,
  );
};

/**
 * Fetches metadata for a specified chatroom.
 * @param {*} db
 * @param {*} chatID
 * @returns
 */
export const fetchChatRoomData = async (db, chatID) => {
  console.log(chatID);
  const chatroomRef = ref(db, `chats/${chatID}`);
  const chatroomDataSnap = await get(chatroomRef);
  console.log(chatroomDataSnap.val());
  if (!chatroomDataSnap.val()) {
    console.error("Chatroom doesn't exist");
    return null;
  }
  return chatroomDataSnap.val();
};
