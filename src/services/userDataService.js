import { equalTo, get, orderByChild, query, ref } from "firebase/database";

export const fetchLastUsernameChangeTime = async (db, userUid) => {
  const lastUsernameChangeRef = ref(db, `users/${userUid}/lastUsernameChange`);
  const lastUserNameChangeSnap = await get(lastUsernameChangeRef);

  return lastUserNameChangeSnap.val();
};

export const fetchUserDataByEmail = async (db, email) => {
  const userQuery = query(
    ref(db, `users`),
    orderByChild("email"),
    equalTo(email),
  );
  const userData = (await get(userQuery)).val();
  return userData;
};
