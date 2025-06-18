import {
  endAt,
  startAt,
  orderByChild,
  ref,
  get,
  query,
} from "firebase/database";

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
