import {
  ref,
  get,
  query,
  orderByChild,
  set,
  startAt,
  endAt,
} from "firebase/database";

export const queryUsernames = async (db, username) => {
  const usernameQuery = query(
    ref(db, "users"),
    orderByChild("username"),
    startAt(username),
    endAt(username + "\uf8ff"),
  );
  const usernameQueryData = (await get(usernameQuery)).val();
  return usernameQueryData;
};

export const fetchUserData = async (db, userUid) => {
  const userDataRef = ref(db, `users/${userUid}`);
  const userData = (await get(userDataRef)).val();
  console.log(userData);
  return userData;
};

export const createUserData = async (db, uid, trimmedUsername, email) => {
  const userRef = ref(db, `users/${uid}`);
  await set(userRef, {
    username: trimmedUsername,
    email: email,
    lastUsernameChange: 0,
  });
};
