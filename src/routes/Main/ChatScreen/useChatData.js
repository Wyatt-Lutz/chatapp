
import { ref, query, set, get, update, endBefore, limitToLast, push, orderByChild, onValue, remove, serverTimestamp } from 'firebase/database';

const NUM_CHATS_PER_PAGE = 10;

export const fetchChats = async(time, chatsRef) => {
  console.info('fetchChats run');
  const messageQuery = query(chatsRef, orderByChild("timestamp"), endBefore(time), limitToLast(NUM_CHATS_PER_PAGE));
  const snap = await get(messageQuery);

  if (!snap.exists()) {
    console.log('no message data');
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
  return {renderState: renderTimeAndSender, time: Date.now()};
};




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
