import { get, increment, ref, remove, set, update } from "firebase/database";
import { addMessage } from "./messageDataService";
import { updateTempTitle } from "../utils/chatroomUtils";

/**
 * Updates the block status of a given user for the current user
 * @param {Database} db - Realtime Database Reference
 * @param {string} clientUserUid - Uid for the client user
 * @param {string} uidToBlock - Uid of the user being blocked by the current user
 * @param {boolean} newBlockedStatus - New status of whether the user is blocked to the client user, false if no, true if yes
 */
export const updateBlockedStatus = async (
  db,
  clientUserUid,
  uidToBlock,
  newBlockedStatus,
) => {
  const userBlockListRef = ref(db, `users/${clientUserUid}/blockList`);
  const newBlockData = { [uidToBlock]: newBlockedStatus };
  await update(userBlockListRef, newBlockData);
};

export const fetchMembersFromChat = async (db, chatID) => {
  const membersRef = ref(db, `members/${chatID}`);
  return (await get(membersRef)).val();
};

export const fetchChatsInData = async (db, uid) => {
  const chatsInRef = ref(db, `users/${uid}/chatsIn`);
  return (await get(chatsInRef)).val();
};

export const fetchNumOfMembers = async (db, chatID) => {
  const chatRef = ref(db, `chats/${chatID}/numOfMembers`);
  const numOfMembers = (await get(chatRef)).val();
  console.log(numOfMembers);
  return numOfMembers;
};

export const removeUserFromChat = async (
  db,
  chatState,
  uidToRemove,
  usernameOfUserRemoved,
  currUserUid,
  resetAllChatContexts,
  memberData,
  memberOptions = {},
  isBanned = false,
) => {
  const { chatID, numOfMembers, tempTitle, ownerUid, memberUids } = chatState;
  if (uidToRemove === currUserUid) {
    if (!isBanned) {
      resetAllChatContexts();
    } else {
      console.error("Can't ban yourself");
      return;
    }
  }

  const userRemovedServerMessage = isBanned
    ? `${usernameOfUserRemoved} has been banned.`
    : uidToRemove === currUserUid
      ? `${usernameOfUserRemoved} has left the chat.`
      : `${usernameOfUserRemoved} has been removed from the chat.`;

  const memberToRemoveRef = ref(db, `members/${chatID}/${uidToRemove}`);
  const chatDataRef = ref(db, `chats/${chatID}`);

  if (numOfMembers && numOfMembers <= 2) {
    await deleteChatRoom(db, chatID);
    return;
  }

  const newMemberUids = memberUids.replace(uidToRemove, "");
  const newTempTitle = updateTempTitle(tempTitle, usernameOfUserRemoved);

  console.log("newMemberUids: " + newMemberUids);
  console.log("newTempTitle: " + newTempTitle);

  await Promise.all([
    update(memberToRemoveRef, {
      isRemoved: true,
      ...memberOptions,
      isBanned: isBanned,
    }),
    update(chatDataRef, { memberUids: newMemberUids, tempTitle: newTempTitle }),
  ]);

  await addMessage(
    userRemovedServerMessage,
    chatID,
    "server",
    db,
    true,
    memberData,
  );

  await updateNumOfMembers(db, chatID, false);

  if (uidToRemove === ownerUid) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);

    // Normalize to [0, 1)
    const randomValue = arr[0] / 2 ** 32;

    // Scale to [0, numOfMembers)
    const scaledRandomValue = randomValue * numOfMembers;
    const members = await fetchMembersFromChat(db, chatID);
    const randomMemberUid = members[scaledRandomValue];

    await transferOwnership(db, chatID, randomMemberUid);
  }

  const chatsInRef = ref(db, `users/${uidToRemove}/chatsIn/${chatID}`);
  //const chatsInRef = ref(db, `users/${uidToRemove}/chatsIn`);
  await remove(chatsInRef);
};

export const addUserToChat = async (db, user, chatroomData) => {
  const { profilePictureURL, username, uid } = user;
  const { chatID, memberUids, tempTitle, numOfMembers } = chatroomData;

  const memberRef = ref(db, `members/${chatID}/${uid}`);
  const chatsInRef = ref(db, `users/${uid}/chatsIn`);
  const chatRef = ref(db, `chats/${chatID}`);

  const updatedTempTitle = updateTempTitle(tempTitle, "", username);
  console.log(updatedTempTitle);
  const newUserUidsArr = [...memberUids.match(/.{1,28}/g), uid];
  const updatedMemberUids = newUserUidsArr.sort().join("");

  await Promise.all([
    set(memberRef, {
      isRemoved: false,
      isBanned: false,
      isOnline: false,
      username: username,
      profilePictureURL: profilePictureURL,
    }),

    update(chatsInRef, {
      [chatID]: 0,
    }),

    update(chatRef, {
      tempTitle: updatedTempTitle,
      numOfMembers: numOfMembers + 1,
      memberUids: updatedMemberUids,
    }),
  ]);
};

export const updateNumOfMembers = async (db, chatID, isAdd) => {
  const numOfMembersRef = ref(db, `chats/${chatID}`);
  const updates = {
    [`numOfMembers`]: increment(isAdd ? 1 : -1),
  };
  await update(numOfMembersRef, updates);
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

  await Promise.all([...deleteUserChatsInRefs, ...deleteChatRefs]); //Parallelization
};

export const transferOwnership = async (db, chatID, newOwnerUid) => {
  const chatMetadataRef = ref(db, `chats/${chatID}`);
  await update(chatMetadataRef, {
    owner: newOwnerUid,
  });
};

/**
 * Fetches the block status of users blocked by current user
 * @param {Database} db - Reference to Realtime Database
 * @param {string} uid - Uid of the user whose block data is fetched
 * @returns {Object} Object of blocked users by current user with true and false values for current blocked status
 */
export const getBlockData = async (db, uid) => {
  const userBlockListRef = ref(db, `users/${uid}/blockList`);

  const userBlockDataSnap = await get(userBlockListRef);
  const userBlockData = userBlockDataSnap.val() || {};

  return userBlockData;
};

/**
 * Fetches a users username using their uid
 * @param {Database} db - Realtime Database Reference
 * @param {string} uid - Uid of the user
 * @returns username of the user
 */
export const getUsernameFromUid = async (db, uid) => {
  const userRef = ref(db, `users/${uid}/username`);

  const usernameSnap = await get(userRef);
  const username = usernameSnap.val();
  console.log(username);
  return username;
};

export const fetchChatUsersByStatus = async (memberData, status) => {
  return memberData.reduce((uids, [uid, userData]) => {
    const isOnline = userData?.isOnline;
    if (
      (status === true && isOnline === true) ||
      (status === false && (isOnline === undefined || isOnline === null))
    ) {
      uids.push(uid);
    }
    return uids;
  }, []);
};

export const unBanUser = async (db, chatID, uid, username, memberData) => {
  const memberRef = ref(db, `members/${chatID}/${uid}`);
  await update(memberRef, { isBanned: false });
  const unBanMessageText = `${username} has been unbanned!`;
  await addMessage(unBanMessageText, chatID, "server", db, true, memberData);
};

export const fetchBannedUsers = async (db, chatID) => {
  const membersRef = ref(db, `members/${chatID}`);
  const memberData = (await get(membersRef)).val();

  const bannedUsers = Object.entries(memberData)
    .filter(([, userData]) => userData.isBanned)
    .map(([uid, user]) => ({ uid, ...user }));

  return bannedUsers;
};
