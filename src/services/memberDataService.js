import { get, ref, remove, update } from "firebase/database";
import { useContext } from "react";
import { ChatContext } from "../providers/ChatContext";
import { addMessage } from "./messageDataService";


/**
 * Updates the block status of a given user for the current user
 * @param {Database} db - Realtime Database Reference
 * @param {string} clientUserUid - Uid for the client user
 * @param {string} uidToBlock - Uid of the user being blocked by the current user
 * @param {boolean} newBlockedStatus - New status of whether the user is blocked to the client user, false if no, true if yes
 */
export const updateBlockedStatus = async(db, clientUserUid, uidToBlock, newBlockedStatus) => {
  const userBlockListRef = ref(db, "users/" + clientUserUid + "/blockList");
  const newBlockData = {[uidToBlock]: newBlockedStatus}
  await update(userBlockListRef, newBlockData);
}


export const removeUserFromChat = async(db, chatID, uidToRemove, usernameOfUserRemoved, currUserUid) => {
  console.log('removeUserFromChat run');
  const { dispatch } = useContext(ChatContext);


  const memberToRemoveRef = ref(db, "members/" + chatID + "/" + uidToRemove);
  const membersRef = ref(db, "members/" + chatID);
  const userChatsInRef = ref(db, "users/" + uidToRemove + "/chatsIn/" + chatID);
  const currUserChatsInRef = ref(db, "users/" + currUserUid + "/chatsIn/" + chatID);

  // If the current user calls the function for themselves to be removed, if they want to leave the chat, change the message accordingly
  const userRemovedServerMessage = uidToRemove === currUserUid ? `${usernameOfUserRemoved} has left the chat.` : `${usernameOfUserRemoved} has been removed from the chat.`;

  await remove(userChatsInRef);

  const membersListSnap = await get(membersRef);
  console.log(membersListSnap.val());
  if (Object.keys(membersListSnap.val()).length < 3) {
    await dispatch({type: "RESET"});
    await Promise.all([
      remove(membersRef),
      remove(currUserChatsInRef),
      remove(ref(db, "messages/" + chatID)),
      remove(ref(db, "chats/" + chatID)),
    ]);
    return;
  }

  await Promise.all([
    update(memberToRemoveRef, {hasBeenRemoved: true}),
    addMessage(userRemovedServerMessage, chatID, "server", db, true), // message, id of chat, sender, database reference, bool whether to show timestamp of message
  ]);



}


export const transferOwnership = async (db, chatID, newOwnerUid) => {
  const chatMetadataRef = ref(db, "chats/" + chatID);
  await update(chatMetadataRef, {
    owner: newOwnerUid,
  });
}


/**
 * Fetches the block status of users blocked by current user
 * @param {Database} db - Reference to Realtime Database
 * @param {string} userUid - Uid of the user whose block data is fetched
 * @returns {Object} Object of blocked users by current user with true and false values for current blocked status
 */
export const getBlockData = async(db, userUid) => {
  const userBlockListRef = ref(db, "users/" + userUid + "/blockList");

  const userBlockDataSnap = await get(userBlockListRef);
  const userBlockData = userBlockDataSnap.val() || {};

  return userBlockData;
}

/**
 * Fetches a users username using their uid
 * @param {Database} db - Realtime Database Reference
 * @param {string} userUid - Uid of the user
 * @returns username of the user
 */
export const getUsernameFromUid = async(db, userUid) => {

  const userRef = ref(db, "users/" + userUid + "/username");

  const usernameSnap = await get(userRef);
  const username = usernameSnap.val();
  console.log(username);
  return username;

}


export const fetchOnlineUsersForChat = async(db, chatID, status) => {
  const membersRef = ref(db, "members/" + chatID);
  const membersSnap = await get(membersRef);
  const membersData = membersSnap.val();

  const onlineMembers = [];

  for (const userUid in membersData) {
    const userData = membersData[userUid];
    if (userData.isOnline === status) {
      onlineMembers.push(userUid);
    }
  }

  return onlineMembers;

  
}


