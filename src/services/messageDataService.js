import {
  ref,
  query,
  set,
  get,
  endBefore,
  endAt,
  startAt,
  runTransaction,
  push,
  orderByChild,
  remove,
  serverTimestamp,
  increment,
  update,
  limitToLast,
} from "firebase/database";
import { fetchMembersByStatus } from "./memberDataService";
import { storage } from "../../firebase";
import { ref as storageRef } from "firebase/storage";
import { uploadFile } from "./storageDataService";

export const fetchOlderChats = async (db, chatID, endTimestamp) => {
  const chatsRef = ref(db, `messages/${chatID}/`);
  const messageQuery = query(
    chatsRef,
    orderByChild("timestamp"),
    endBefore(endTimestamp),
    limitToLast(10),
  );
  const messageSnap = await get(messageQuery);
  return messageSnap.val();
};

export const addMessage = async (
  text,
  chatID,
  uid,
  db,
  showTimeAndSender,
  memberData,
  fileToUpload = null,
) => {
  const chatRef = ref(db, `messages/${chatID}/`);
  const newMessageRef = push(chatRef);

  const timestamp = serverTimestamp();
  const newMessage = {
    timestamp,
    text,
    sender: uid,
    showTimeAndSender,
    hasBeenEdited: false,
    fileRef: fileToUpload ? "uploading" : null,
    fileType: fileToUpload?.type || null,
    fileName: fileToUpload?.name || null,
  };
  await set(newMessageRef, newMessage);

  if (fileToUpload) {
    const fileStorageLocation = storageRef(
      storage,
      `chats/${chatID}/${newMessageRef.key}`,
    );
    const fileRef = await uploadFile(fileToUpload, fileStorageLocation);
    await update(newMessageRef, {
      fileRef: fileRef,
    });
  }

  const firstMessageIdRef = ref(db, `chats/${chatID}/firstMessageID`);
  await runTransaction(firstMessageIdRef, (currID) => {
    if (!currID) {
      return newMessageRef.key; //the message ID
    }
    return currID;
  });

  const chatDataRef = ref(db, `chats/${chatID}`);
  await update(chatDataRef, { lastMessageTimestamp: timestamp });

  await updateUnreadCount(db, chatID, memberData);
};

/**
 * Updates the number of unread messages for each offline user in a chatroom.
 * Uses runTransaction to ensure atomicity
 * @param {Database} db - Firebase Realtime Database Reference
 * @param {String} chatID - ID of the chatroom
 */
const updateUnreadCount = async (db, chatID, memberData) => {
  const transformedMemberData = [...memberData.entries()];
  const offlineMembers = await fetchMembersByStatus(
    transformedMemberData,
    false,
  );

  await Promise.all(
    offlineMembers.map((uid) => {
      update(ref(db, `users/${uid}/chatsIn`), { [`${chatID}`]: increment(1) });
    }),
  );
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

export const queryMessages = async (db, chatID, searchQuery) => {
  const messagesRef = ref(db, `messages/${chatID}`);
  const textQuery = query(
    messagesRef,
    orderByChild("text"),
    startAt(searchQuery),
    endAt(searchQuery + "\uf8ff"),
  );
  const textSnap = await get(textQuery);
  const textResults = textSnap.val() || {};

  const fileQuery = query(
    messagesRef,
    orderByChild("fileName"),
    startAt(searchQuery),
    endAt(searchQuery + "\uf8ff"),
  );
  const fileSnap = await get(fileQuery);
  const fileResults = fileSnap.val() || {};

  return { ...textResults, ...fileResults };
};
