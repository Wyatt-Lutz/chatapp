import { ref, get, query, orderByChild, equalTo, set, startAt, endAt } from "firebase/database";


export const fetchUsernameData = async(db) => {
  const usersQuery = query(ref(db, "users"), orderByChild('username'));
  const usersQuerySnap = await get(usersQuery);
  const usersData = usersQuerySnap.val();
  const usernames = Object.values(usersData).map((user) => user.username);
  return usernames;
}

export const queryUsernames = async(db, username) => {
  const usernameQuery = query(ref(db, "users"), orderByChild('username'), startAt(username), endAt(username + "\uf8ff"));
  const usernameQueryData = (await get(usernameQuery)).val();
  return usernameQueryData;
}


export const checkIfUserExists = async(db, newUser) => {
  const usersQuery = query(ref(db, "users"), orderByChild('username'), equalTo(newUser));
  const usersQuerySnap = await get(usersQuery);
  if (!usersQuerySnap.exists()) {
    return null;
  }
  console.log(usersQuerySnap.val());
  return usersQuerySnap.val();

}


export const createUserData = async(db, uid, trimmedUsername, email) => {
  const userRef = ref(db, `users/${uid}`);
  set((userRef), {
    username: trimmedUsername,
    email: email,
    blocked: [],
    chatsIn: [],
    lastUsernameChange: 0,
  });
}