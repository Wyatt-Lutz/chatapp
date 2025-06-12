import { get, ref } from "firebase/database";

export const fetchLastUsernameChangeTime = async (db, userUid) => {
  const lastUsernameChangeRef = ref(db, `users/${userUid}/lastUsernameChange`);
  const lastUserNameChangeSnap = await get(lastUsernameChangeRef);

  return lastUserNameChangeSnap.val();
};
