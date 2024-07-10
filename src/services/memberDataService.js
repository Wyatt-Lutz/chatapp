import { get, ref, remove, update } from "firebase/database";
import { addMessage } from "./messageDataService";



export const blockUser = async(db, clientUserUid, uidToBlock) => {
  console.log('block user run');

  const userBlockListRef = ref(db, "users/" + clientUserUid + "/blockList");
  const newBlockData = {[uidToBlock]: true}
  await update(userBlockListRef, newBlockData);
}

export const removeUserFromChat = async(db, chatID, uidToRemove, usernameOfUserRemoved, currUserUid, dispatch) => {
  console.log('removeUserFromChat run');
  console.log(chatID);

  const memberToRemoveRef = ref(db, "members/" + chatID + "/" + uidToRemove);
  const membersRef = ref(db, "members/" + chatID);
  const userChatsInRef = ref(db, "users/" + uidToRemove + "/chatsIn/" + chatID);
  const currUserChatsInRef = ref(db, "users/" + currUserUid + "/chatsIn/" + chatID);
  const ownerRef = ref(db, "chats/" + chatID + "/owner");



  // If the current user calls the function for themselves to be removed, if they want to leave the chat, change the message accordingly
  const userRemovedServerMessage = uidToRemove === currUserUid ? `${usernameOfUserRemoved} has left the chat.` : `${usernameOfUserRemoved} has been removed from the chat.`;

  await remove(userChatsInRef);

  const membersListSnap = await get(membersRef);
  const membersListUids = Object.keys(membersListSnap.val());
  if (membersListUids.length < 3) {
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

  //If the user being removed is the owner of the chat, then transfer ownership
  const ownerData = await get(ownerRef);
  let newOwnerUid = "";
  if (ownerData.val() === currUserUid) {
    if (membersListUids[0] === currUserUid) {
      newOwnerUid = membersListUids[1];
    }
    newOwnerUid = membersListUids[0];
    transferOwnership(db, chatID, newOwnerUid);
  }
}


export const transferOwnership = async (db, chatID, newOwnerUid) => {
  const chatMetadataRef = ref(db, "chats/" + chatID);
  await update(chatMetadataRef, {
    owner: newOwnerUid,
  });
}


