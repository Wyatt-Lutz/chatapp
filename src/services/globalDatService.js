import { push, ref, set, update, get, query, orderByChild, equalTo } from "firebase/database";


export const fetchUsernameData = async(db) => {
  console.log('yooo')
  const usersQuery = query(ref(db, "users"), orderByChild('username'));
  const usersQuerySnap = await get(usersQuery);
  return usersQuerySnap.val();
}


export const checkIfUserExists = async(db, newUser) => {
  const usersQuery = query(ref(db, "users"), orderByChild('username'), equalTo(newUser));
  const usersQuerySnap = await get(usersQuery);
  if (!usersQuerySnap.exists()) {
    return null;
  }
  return usersQuerySnap.val();
}