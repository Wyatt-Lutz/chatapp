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

export const checkIfUsernameExists = async (db, username) => {
  const usernamesRef = ref(db, `publicUsernames/${username}`);
  const usernameSnap = await get(usernamesRef);
  return usernameSnap.exists();
};

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

  try {
    await updatePublicUsername(db, username, "");

    await update(userRef, {
      username,
      email,
      lastUsernameChange: 0,
      profilePictureURL,
    });
  } catch (error) {
    console.error(error);
    await rollBackPublicUsernameData(db, username, "");
  }
};

export const updatePublicUsername = async (db, username, oldUsername = "") => {
  if (oldUsername) {
    const oldPublicUsernameRef = ref(db, `publicUsernames/${oldUsername}`);
    await remove(oldPublicUsernameRef);
  }

  const newPublicUsernameRef = ref(db, `publicUsernames/${username}`);

  await runTransaction(newPublicUsernameRef, (username) => {
    if (!username) {
      return true;
    }
    console.error("username taken");
  });
};

export const rollBackPublicUsernameData = async (
  db,
  newUsername,
  oldUsername = "",
) => {
  const newPublicUsernameRef = ref(db, `publicUsernames/${newUsername}`);
  await remove(newPublicUsernameRef);

  if (oldUsername) {
    const oldPublicUsernameRef = ref(db, `publicUsernames/${oldUsername}`);
    await set(oldPublicUsernameRef, true);
  }
};
