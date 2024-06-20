import { ref, remove, update } from "firebase/database";

export const blockUser = async(db, clientUserUid, uidToBlock) => {
  console.log('block user run');

  const userBlockListRef = ref(db, "users/" + clientUserUid + "/blockList");
  const newBlockData = {[uidToBlock]: true}
  await update(userBlockListRef, newBlockData);
}

export const removeUserFromChat = async(db, chatID, uidToRemove) => {
  console.log('removeUserFromChat run');



  const membersRef = ref(db, "members/" + chatID + "/" + uidToRemove);
  await update(membersRef, {hasBeenRemoved: true})

  const userChatsInRef = ref(db, "users/" + uidToRemove + "/chatsIn" + chatID);
  await remove(userChatsInRef)
}