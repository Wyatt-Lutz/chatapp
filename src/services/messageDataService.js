import { ref, query, set, get, endBefore, runTransaction, push, orderByChild, remove, serverTimestamp, limitToFirst, increment, update } from 'firebase/database';
import { fetchChatUsersByStatus } from "./memberDataService";


export const fetchOlderChats = async(endTimestamp, db, chatID) => {
  const chatsRef = ref(db, `messages/${chatID}/`);
  const messageQuery = query(chatsRef, orderByChild("timestamp"), endBefore(endTimestamp), limitToFirst(10));
  const messageSnap = await get(messageQuery);
  return messageSnap.val();
}




export const addMessage = async(text, chatID, userUID, db, renderTimeAndSender, firstMessageID, chatDispatch) => {
  console.log(firstMessageID);
  const chatRef = ref(db, `messages/${chatID}/`);
  const newMessageRef = push(chatRef);
  const timestamp = serverTimestamp();
  const newMessage = {
    timestamp,
    text,
    sender: userUID,
    renderTimeAndSender,
    hasBeenEdited: false,
  }
  await set(newMessageRef, newMessage);

   //If there isn't a first message already, set this message to be the first using runTransaction for atomicity
  if (!firstMessageID) {

    const firstMessageIdRef = ref(db, `chats/${chatID}/firstMessageID`);
    await runTransaction(firstMessageIdRef, (currID) => {
      if (!currID) {
        return newMessageRef.key; //the message ID
      }
      return currID;
    });
    chatDispatch({type: "UPDATE_FIRST_MESSAGE_ID", payload: newMessageRef.key});
  }

  await updateUnreadCount(db, chatID);





};


/**
 * Updates the number of unread messages for each offline user in a chatroom.
 * Uses runTransaction to ensure atomicity
 * @param {Database} db - Firebase Realtime Database Reference
 * @param {String} chatID - ID of the chatroom
 */
const updateUnreadCount = async(db, chatID) => {
  const offlineMembers = await fetchChatUsersByStatus(db, chatID, false);
  for (const userUid of offlineMembers) {
    const userDataRef = ref(db, `users/${userUid}/chatsIn`);

    const updates = {
      [`${chatID}`]: increment(1),
    };
    await update(userDataRef, updates);
  }
}





export const updateUserOnlineStatus = async(newOnlineStatus, db, chatID, uid) => {

  const memberSnap = await get(ref(db, `members/${chatID}`));
  if (!memberSnap.exists()) {
    return;
  }
  const dataRef = ref(db, `members/${chatID}/${uid}`);

  await update(dataRef, {
    "isOnline": newOnlineStatus,
  });

  if (newOnlineStatus) {
    const userDataRef = ref(db, `users/${uid}/chatsIn`);
    await update(userDataRef, {[chatID]: 0});
  }

}





export const editMessage = async(messageUid, text, chatID, db) => {
  const chatRef = ref(db, `messages/${chatID}/${messageUid}`)
  await update(chatRef, {
    text: text,
    hasBeenEdited: true
  });
}

export const deleteMessage = async(messageUid, db, chatID) => {
  const chatRef = ref(db, `messages/${chatID}/${messageUid}`)
  await remove(chatRef);
}


export const editTitle = async(newTitle, chatID, db, displayName, chatDispatch) => {
  const titleRef = ref(db, `chats/${chatID}`);
  await update(titleRef, {
    title: newTitle,
  });
  const changedTitleText = displayName + " has changed the chat name to " + newTitle;
  await addMessage(changedTitleText, chatID, "server", db, true, chatDispatch);
}
