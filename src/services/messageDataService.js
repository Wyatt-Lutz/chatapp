import {
  ref,
  query,
  set,
  get,
  endBefore,
  runTransaction,
  push,
  orderByChild,
  remove,
  serverTimestamp,
  limitToFirst,
  increment,
  update,
  limitToLast,
} from "firebase/database";
import { fetchChatUsersByStatus } from "./memberDataService";
import { storage } from "../../firebase";
import { ref as storageRef } from "firebase/storage";
import { uploadPicture } from "./storageDataService";

export const fetchOlderChats = async (db, chatID, endTimestamp) => {
  const chatsRef = ref(db, `messages/${chatID}/`);
  const messageQuery = query(
    chatsRef,
    orderByChild("timestamp"),
    endBefore(endTimestamp),
    limitToLast(10),
  );
  const messageSnap = await get(messageQuery);
  console.log(messageSnap.val());
  return messageSnap.val();
};

export const addMessage = async (
  text,
  chatID,
  userUID,
  db,
  renderTimeAndSender,
  firstMessageID,
  chatDispatch,
  imageToUpload = null,
  memberData,
) => {
  const chatRef = ref(db, `messages/${chatID}/`);
  const newMessageRef = push(chatRef);

  const timestamp = serverTimestamp();
  const newMessage = {
    timestamp,
    text,
    sender: userUID,
    renderTimeAndSender,
    hasBeenEdited: false,
    imageRef: imageToUpload ? "uploading" : null,
  };
  await set(newMessageRef, newMessage);

  if (imageToUpload) {
    const imageStorageLocation = storageRef(
      storage,
      `chats/${chatID}/${newMessageRef.key}`,
    );
    const imageRef = await uploadPicture(imageToUpload, imageStorageLocation);
    await update(newMessageRef, {
      imageRef: imageRef,
    });
  }

  //If there isn't a first message already, set this message to be the first using runTransaction for atomicity
  if (!firstMessageID) {
    const firstMessageIdRef = ref(db, `chats/${chatID}/firstMessageID`);
    await runTransaction(firstMessageIdRef, (currID) => {
      if (!currID) {
        return newMessageRef.key; //the message ID
      }
      return currID;
    });
    chatDispatch({
      type: "UPDATE_FIRST_MESSAGE_ID",
      payload: newMessageRef.key,
    });
  }

  await updateUnreadCount(db, chatID, memberData);
};

export const updateFirstMessageID = async (db, chatID, messageID) => {
  const chatRef = ref(db, `chats/${chatID}`);
  await update(chatRef, {
    firstMessageID: messageID,
  });
};

/**
 * Updates the number of unread messages for each offline user in a chatroom.
 * Uses runTransaction to ensure atomicity
 * @param {Database} db - Firebase Realtime Database Reference
 * @param {String} chatID - ID of the chatroom
 */
const updateUnreadCount = async (db, chatID, memberData) => {
  const offlineMembers = await fetchChatUsersByStatus(memberData, false);

  for (const userUid of offlineMembers) {
    const userDataRef = ref(db, `users/${userUid}/chatsIn`);

    const updates = {
      [`${chatID}`]: increment(1),
    };
    await update(userDataRef, updates);
  }
};

export const editMessage = async (messageUid, text, chatID, db) => {
  const chatRef = ref(db, `messages/${chatID}/${messageUid}`);
  await update(chatRef, {
    text: text,
    hasBeenEdited: true,
  });
};

export const deleteMessage = async (db, chatID, messageUid) => {
  const chatRef = ref(db, `messages/${chatID}/${messageUid}`);
  await remove(chatRef);
};

export const editTitle = async (
  newTitle,
  chatID,
  db,
  displayName,
  chatDispatch,
) => {
  const titleRef = ref(db, `chats/${chatID}`);
  await update(titleRef, {
    title: newTitle,
  });
  const changedTitleText =
    displayName + " has changed the chat name to " + newTitle;
  await addMessage(changedTitleText, chatID, "server", db, true, chatDispatch);
};
