import { endAt, startAt, orderByChild, ref, get, query } from "firebase/database";

export const queryMessages = async(db, chatID, searchQuery) => {
  const messagesRef = ref(db, `messages/${chatID}`);
  const messagesQuery = query(messagesRef, orderByChild('text'), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
  const messagesSnap = await get(messagesQuery);
  return messagesSnap.val();
}