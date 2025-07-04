import {
  push,
  ref,
  set,
  update,
  get,
  serverTimestamp,
  remove,
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
export const fetchChatRoomData = async (db, chatID, prop) => {
  const chatroomRef = prop
    ? ref(db, `chats/${chatID}/${prop}`)
    : ref(db, `chats/${chatID}`);
  const chatroomDataSnap = await get(chatroomRef);
  if (!chatroomDataSnap.val()) {
    console.error("Chatroom doesn't exist");
    return null;
  }
  return chatroomDataSnap.val();
};

export const updateFirstMessageID = async (db, chatID, messageID) => {
  const chatRef = ref(db, `chats/${chatID}`);
  await update(chatRef, {
    firstMessageID: messageID,
  });
};

export const deleteChatRoom = async (db, chatID, memberData = null) => {
  if (!memberData) {
    memberData = Object.keys(await fetchMembersFromChat(db, chatID));
  }

  const deleteUserChatsInRefs = memberData.map((uid) => {
    remove(ref(db, `users/${uid}/chatsIn/${chatID}`));
  });

  const deleteChatRefs = [
    remove(ref(db, `members/${chatID}`)),
    remove(ref(db, `messages/${chatID}`)),
    remove(ref(db, `chats/${chatID}`)),
  ];

  await Promise.all([...deleteUserChatsInRefs, ...deleteChatRefs]);
};

export const transferOwnership = async (db, chatID, newOwnerUid) => {
  const chatMetadataRef = ref(db, `chats/${chatID}`);
  await update(chatMetadataRef, {
    owner: newOwnerUid,
  });
};

export const editTitle = async (
  newTitle,
  chatID,
  db,
  displayName,
  memberData,
) => {
  const titleRef = ref(db, `chats/${chatID}`);
  await update(titleRef, {
    title: newTitle,
  });
  const changedTitleText =
    displayName + " has changed the chat name to " + newTitle;
  await addMessage(changedTitleText, chatID, "server", db, true, memberData);
};
