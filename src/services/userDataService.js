import { get, ref } from "firebase/database"


export const fetchLastUsernameChangeTime = async(db, userUid) => {
  const userRef = ref(db, `users/${userUid}`);
  const userDataSnap = await get(userRef);

  const {lastUsernameChange} = userDataSnap.val();
  return lastUsernameChange;
}