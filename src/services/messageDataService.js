import dayjs from "dayjs";
import { ref, query, set, get, update, endBefore, runTransaction, push, orderByChild, remove, serverTimestamp, limitToFirst } from 'firebase/database';
import { fetchOnlineUsersForChat } from "./memberDataService";


export const fetchOlderChats = async(endTimestamp, db, chatID) => {
  console.info('fetchChats run');
  const chatsRef = ref(db, `messages/${chatID}/`);
  const messageQuery = query(chatsRef, orderByChild("timestamp"), endBefore(endTimestamp), limitToFirst(10));
  const messageSnap = await get(messageQuery);
  return messageSnap.val();
}





export const addMessage = async(text, chatID, userUID, db, renderTimeAndSender, firstMessageID) => {
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

  await updateUnreadCount(db, chatID);


  //If there isn't a first message already, set this to be the first using runTransaction for atomicity
  if (!firstMessageID) {
    const firstMessageIdRef = ref(db, `chats/${chatID}/firstMessageID`);
    await runTransaction(firstMessageIdRef, (currID) => {
      if (currID === null) {
        return newMessageRef.key; //the message ID
      }
      return currID;
    });
  }

};


/**
 * Updates the number of unread messages for each offline user in a chatroom.
 * Uses runTransaction to ensure atomicity
 * @param {Database} db - Firebase Realtime Database Reference
 * @param {String} chatID - ID of the chatroom
 */
const updateUnreadCount = async(db, chatID) => {
  const offlineMembers = await fetchOnlineUsersForChat(db, chatID, false);
  for (const userUid of offlineMembers) {
    const userDataRef = ref(db, `users/${userUid}/chatsIn/${chatID}`);
    const transactionUpdate = (currData) => {
      if (currData === null) {
        return 0;
      } else {
        return currData + 1;
      }
    }
    await runTransaction(userDataRef, transactionUpdate).catch((error) => {
      console.error('update unreadcount transaction failed:' + error);
    });
  }
}

/**
 * Determines whether to show the timestamp and the username of user for a message.
 * Will not render them if the last message was sent by the client user and the last message was less than 5 minutes ago.
 * @param {*} lastMessage
 * @param {*} currUser
 * @returns {Boolean}
 */
export const calculateRenderTimeAndSender = (lastMessage, currUserDisplayName) => {
  if (lastMessage && lastMessage.sender === currUserDisplayName && (Date.now() - lastMessage.timestamp < 180000)) {
    return false;
  }
  return true;
}



export const updateUserOnlineStatus = async(newOnlineStatus, db, chatID, uid) => {

  const memberSnap = await get(ref(db, "members/" + chatID));
  if (!memberSnap.exists()) {
    return;
  }
  const dataRef = ref(db, "members/" + chatID + "/" + uid);

  await update(dataRef, {
    "isOnline": newOnlineStatus,
  });

  if (newOnlineStatus) {
    const userDataRef = ref(db, "users/" + uid + "/chatsIn");
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


export const editTitle = async(newTitle, chatID, db, displayName) => {

  const titleRef = ref(db, "chats/" + chatID);
  await update(titleRef, {
    title: newTitle,
  });
  const changedTitleText = displayName + " has changed the chat name to " + newTitle;
  await addMessage(changedTitleText, chatID, "server", db, true);
}


export const calcTime = (time) => {
  const formattedTime = dayjs(time).format('h:mm A');
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayMidnight = new Date(todayMidnight);
  yesterdayMidnight.setDate(todayMidnight.getDate() - 1);
  if (time - todayMidnight.getTime() > 0) {
    return 'Today at ' + formattedTime;
  } else if (time - yesterdayMidnight.getTime() > 0) {
    return 'Yesterday at' + formattedTime;
  }
  return dayjs(time).format('MM/DD/YYYY h:m A');
}