import { equalTo, get, orderByChild, query, ref } from "firebase/database";

export const fetchLastUsernameChangeTime = async (db, uid) => {
  const lastUsernameChangeRef = ref(db, `users/${uid}/lastUsernameChange`);
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

export const updateProfilePicture = async (db, uid, profilePictureURL) => {
  const userRef = ref(db, `users/${uid}`);
  await update(userRef, {
    profilePictureURL: profilePictureURL,
  });
};
