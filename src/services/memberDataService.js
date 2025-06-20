import { get, increment, ref, remove, set, update } from "firebase/database";
import { addMessage } from "./messageDataService";
import { fetchChatRoomData } from "./chatBarDataService";
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

export const fetchChatsInData = async (db, userUid) => {
  const chatsInRef = ref(db, `users/${userUid}/chatsIn`);
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
  chatID,
  uidToRemove,
  usernameOfUserRemoved,
  currUserUid,
  numOfMembers,
  chatDispatch,
  resetAllChatContexts,
  memberOptions = {},
) => {
  console.log("chatID: " + chatID);
  console.log("uidToRemove: " + uidToRemove);
  if (uidToRemove === currUserUid) {
    resetAllChatContexts();
  }
  const memberToRemoveRef = ref(db, `members/${chatID}/${uidToRemove}`);
  const chatDataRef = ref(db, `chats/${chatID}`);

  const userRemovedServerMessage =
    uidToRemove === currUserUid
      ? `${usernameOfUserRemoved} has left the chat.`
      : `${usernameOfUserRemoved} has been removed from the chat.`;

  console.log(chatID);
  console.log(numOfMembers);

  if (!numOfMembers) {
    numOfMembers = await fetchNumOfMembers(db, chatID);
  }

  if (numOfMembers && numOfMembers <= 2) {
    await deleteChatRoom(db, chatID);
    resetAllChatContexts();
    return;
  }

  const { tempTitle, ownerUid, memberUids } = await fetchChatRoomData(
    db,
    chatID,
  );

  const newMemberUids = memberUids.replace(uidToRemove, "");
  const newTempTitle = updateTempTitle(tempTitle, usernameOfUserRemoved);

  console.log("newMemberUids: " + newMemberUids);
  console.log("newTempTitle: " + newTempTitle);

  await Promise.all([
    update(memberToRemoveRef, { hasBeenRemoved: true, ...memberOptions }),
    update(chatDataRef, { memberUids: newMemberUids, tempTitle: newTempTitle }),
  ]);

  await addMessage(
    userRemovedServerMessage,
    chatID,
    "server",
    db,
    true,
    chatDispatch,
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

    await transferOwnership(db, chatID, randomMemberUid, chatDispatch);
  }

  const chatsInRef = ref(db, `users/${uidToRemove}/chatsIn/${chatID}`);
  //const chatsInRef = ref(db, `users/${uidToRemove}/chatsIn`);
  await remove(chatsInRef);
};

export const addUserToChat = async (
  db,
  chatID,
  userUid,
  username,
  profilePictureURL,
  numOfMembers,
  chatDispatch,
) => {
  const memberRef = ref(db, `members/${chatID}/${userUid}`);
  const chatsInRef = ref(db, `users/${userUid}/chatsIn`);
  const chatRef = ref(db, `chats/${chatID}`);
  const { tempTitle, memberUids } = await fetchChatRoomData(db, chatID);
  const updatedTempTitle = updateTempTitle(tempTitle, "", username);
  console.log(updatedTempTitle);
  const newUserUidsArr = [...memberUids.match(/.{1,28}/g), userUid];
  const updatedMemberUids = newUserUidsArr.sort().join("");

  await Promise.all([
    set(memberRef, {
      hasBeenRemoved: false,
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

  chatDispatch({ type: "UPDATE_NUM_OF_MEMBERS", payload: numOfMembers + 1 });
};

export const updateNumOfMembers = async (db, chatID, isAdd) => {
  const numOfMembersRef = ref(db, `chats/${chatID}`);
  const updates = {
    [`numOfMembers`]: increment(isAdd ? 1 : -1),
  };
  await update(numOfMembersRef, updates);
};

export const deleteChatRoom = async (db, chatID, memberData = null) => {
  console.log("deleting chat room");
  if (!memberData) {
    memberData = Object.keys(await fetchMembersFromChat(db, chatID));
  }

  const membersRef = ref(db, `members/${chatID}`);

  for (const memberUid of memberData) {
    const chatsInRef = ref(db, `users/${memberUid}/chatsIn/${chatID}`);
    await remove(chatsInRef);
  }
  await Promise.all([
    remove(membersRef),
    remove(ref(db, `messages/${chatID}`)),
    remove(ref(db, `chats/${chatID}`)),
  ]);
};

export const transferOwnership = async (
  db,
  chatID,
  newOwnerUid,
  chatDispatch,
) => {
  const chatMetadataRef = ref(db, `chats/${chatID}`);
  await update(chatMetadataRef, {
    owner: newOwnerUid,
  });

  chatDispatch({ type: "UPDATE_OWNER", payload: newOwnerUid });
};

/**
 * Fetches the block status of users blocked by current user
 * @param {Database} db - Reference to Realtime Database
 * @param {string} userUid - Uid of the user whose block data is fetched
 * @returns {Object} Object of blocked users by current user with true and false values for current blocked status
 */
export const getBlockData = async (db, userUid) => {
  const userBlockListRef = ref(db, `users/${userUid}/blockList`);

  const userBlockDataSnap = await get(userBlockListRef);
  const userBlockData = userBlockDataSnap.val() || {};

  return userBlockData;
};

/**
 * Fetches a users username using their uid
 * @param {Database} db - Realtime Database Reference
 * @param {string} userUid - Uid of the user
 * @returns username of the user
 */
export const getUsernameFromUid = async (db, userUid) => {
  const userRef = ref(db, `users/${userUid}/username`);

  const usernameSnap = await get(userRef);
  const username = usernameSnap.val();
  console.log(username);
  return username;
};

export const fetchChatUsersByStatus = async (memberData, status) => {
  return [...memberData]
    .filter(([_, user]) => {
      if (status === true) return user?.isOnline === true;
      if (status === false) return user?.isOnline == null;
      return false;
    })
    .map(([userUid, _]) => userUid);
};
