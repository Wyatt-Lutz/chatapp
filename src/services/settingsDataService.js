
import { updateEmail, updateProfile, verifyBeforeUpdateEmail } from "firebase/auth";
import { checkIfUserExists } from "./chatBarDataService"
import { get, update, ref} from "firebase/database";

export const changeUsername = async(db, newUsername, currUser) => {
  const userData = await checkIfUserExists(db, newUsername);
  if (userData) {
    console.log('username already exists');
    return false;
  }

  const currUserDataRef = ref(db, "users/" + currUser.uid);
  await update(currUserDataRef, {
    username: newUsername,
  });

  const chatsInRef = ref(db, "users/" + currUser.uid + '/chatsIn');
  const chatsInSnap = await get(chatsInRef);
  const chatroomIds = Object.keys(chatsInSnap.val());
  await Promise.all(
    chatroomIds.map((chatroomID) => {
      const chatroomRef = ref(db, "members/" + chatroomID + "/" + currUser.uid);
      update(chatroomRef, {
        username: newUsername,
      });
    })
  );

  updateProfile(currUser, {
    displayName: newUsername,
  });


  return true;
}



export const changeEmail = async(db, currUser, newEmail) => {
  const userDataRef = ref(db, "users/" + currUser.uid);
  await update(userDataRef, {
    email: newEmail,
  });
}