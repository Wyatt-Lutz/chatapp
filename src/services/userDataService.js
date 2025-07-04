import {
  equalTo,
  set,
  startAt,
  endAt,
  get,
  orderByChild,
  query,
  ref,
  update,
  runTransaction,
  remove,
} from "firebase/database";

export const fetchUserDataByEmail = async (db, email) => {
  const userQuery = query(
    ref(db, `users`),
    orderByChild("email"),
    equalTo(email),
  );
  const userData = (await get(userQuery)).val();
  return userData;
};

export const updateProfilePicture = async (db, uid, profilePictureURL) => {
  const userRef = ref(db, `users/${uid}`);
  await update(userRef, {
    profilePictureURL: profilePictureURL,
  });
};

export const checkIfUsernameExists = async (db, username) => {
  const usernamesRef = ref(db, `publicUsernames/${username}`);
  const usernameSnap = await get(usernamesRef);
  return usernameSnap.exists();
};

export const queryUsernames = async (db, username) => {
  const usernameQuery = query(
    ref(db, "usernames"),
    orderByChild("username"),
    startAt(username),
    endAt(username + "\uf8ff"),
  );
  const usernameQueryData = (await get(usernameQuery)).val();
  return usernameQueryData;
};

export const fetchUserData = async (db, uid, prop) => {
  const userDataRef = prop
    ? ref(db, `users/${uid}/${prop}`)
    : ref(db, `users/${uid}`);
  const userData = (await get(userDataRef)).val() || {};
  return userData;
};

export const createUserData = async (
  db,
  uid,
  username,
  email,
  profilePictureURL,
) => {
  const userRef = ref(db, `users/${uid}`);
  const publicUsernamesRef = ref(db, `publicUsernames/${username}`);
  try {
    await runTransaction(publicUsernamesRef, (username) => {
      if (!username) {
        return true;
      }
      throw new Error("username-taken");
    });

    await set(userRef, {
      username,
      email,
      lastUsernameChange: 0,
      profilePictureURL,
    });
  } catch (error) {
    if (error === "username-taken") {
      console.error("username is taken");
    }

    await remove(publicUsernamesRef);
  }
};
