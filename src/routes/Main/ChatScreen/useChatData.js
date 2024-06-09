
import { ref, query, set, get, update, endBefore, runTransaction, limitToLast, push, orderByChild, onValue, remove, serverTimestamp } from 'firebase/database';

const NUM_CHATS_PER_PAGE = 10;

export const fetchChats = async(time, db, chatID) => {
  console.info('fetchChats run');
  const chatsRef = ref(db, "messages/" + chatID + "/");
  const messageQuery = query(chatsRef, orderByChild("timestamp"), endBefore(time), limitToLast(NUM_CHATS_PER_PAGE));
  const snap = await get(messageQuery);

  if (!snap.exists()) {
    return [];
  }
  const messageData = []
  snap.forEach((child) => {
    messageData.push(child.val());
  })
  return messageData;
}



export const addMessage = async({text}, chatID, displayName, db, chatData, prevTimestamp) => {
  let renderTimeAndSender = true;
  if (chatData.data && prevTimestamp) {
    const previousMessage = chatData.data[chatData.data.length - 1];
    if (previousMessage.sender === displayName && Date.now() - prevTimestamp < 180000) {
      renderTimeAndSender = false;
    }
  }


  const chatRef = ref(db, "messages/" + chatID + "/");
  const newMessageRef = push(chatRef);
  const timestamp = serverTimestamp();
  const newMessage = {
    timestamp,
    text,
    id: newMessageRef.key,
    sender: displayName,
    renderTimeAndSender,
  }
  await set(newMessageRef, newMessage);

  await updateUnreadCount(db, chatID);
  return {renderState: renderTimeAndSender, time: Date.now()};

};

const updateUnreadCount = async(db, chatID) => {
  const usersRef = ref(db, "chats/" + chatID);
  const usersSnap = await get(usersRef);
  if (!usersSnap.exists()) {
    return;
  }

  for(const userUid in usersSnap.val()) {
    if (usersSnap.val()[userUid] === false) {
      const userDataRef = ref(db, "users/" + userUid + `/chatsIn/${chatID}`);
      const transactionUpdate = (currData) => {
        if (currData === null) {
          return 0;
        } else {
          return currData + 1;
        }
      }
      runTransaction(userDataRef, transactionUpdate).catch((error) => {
        console.error('update unreadcount transaction failed:' + error);
      })
    }
  }
}

export const updateUserOnlineStatus = async(isOnline, db, chatID, userUid) => {
  const dataRef = ref(db, "chats/" + chatID);

  await update(dataRef, {
    [userUid]: isOnline,
  });

  if (isOnline) {
    const userDataRef = ref(db, "users/" + userUid + "/chatsIn");
    await update(userDataRef, {[chatID]: 0});
  }

}





export const editMessage = async(id, text, chatID, db) => {
  const chatRef = ref(db, "messages/" + chatID + "/" + id);
  await update(chatRef, {
    text: text
  });
}

export const deleteMessage = async(id, db, chatID) => {
  const chatRef = ref(db, "messages/" + chatID + "/" + id);
  await remove(chatRef);
}