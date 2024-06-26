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


  const memberToRemoveRef = ref(db, "members/" + chatID + "/" + uidToRemove);
  const membersRef = ref(db, "members/" + chatID);
  const userChatsInRef = ref(db, "users/" + uidToRemove + "/chatsIn/" + chatID);
  const currUserChatsInRef = ref(db, "users/" + currUserUid + "/chatsIn/" + chatID);
  const userRemovedServerMessage = usernameOfUserRemoved + " has been removed from the chat.";

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