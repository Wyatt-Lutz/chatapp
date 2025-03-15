
import { deleteUser, updateProfile } from "firebase/auth";

import { get, update, ref, remove} from "firebase/database";
import { checkIfUserExists } from "./globalDatService";
import { removeUserFromChat } from "./memberDataService";
import { signUserOut } from "../utils/userUtils";
import { auth } from "../../firebase";

export const changeUsername = async(db, newUsername, currUser) => {
  const userData = await checkIfUserExists(db, newUsername);
  if (userData) {
    console.log('username already exists');
    return;
  }


  const currUserDataRef = ref(db, `users/${currUser.uid}`);
  await update(currUserDataRef, {
    username: newUsername,
    lastUsernameChange: Date.now(),
  });

  const chatsInRef = ref(db, `users/${currUser.uid}/chatsIn`);
  const chatsInSnap = await get(chatsInRef);
  const chatsIn = chatsInSnap.val();

  if (chatsIn) {
    const updateChatroomsPromise = Object.keys(chatsIn).map(async (chatID) => {
      const chatroomMemberRef = ref(db, `members/${chatID}/${currUser.uid}`);
      const chatRoomRef = ref(db, `chats/${chatID}`);
      const chatRoomDataSnap = await get(chatRoomRef);
      const chatRoomData = chatRoomDataSnap.val();
      const tempTitle = chatRoomData.tempTitle;
      const updatedTempTitle = tempTitle.split(', ').filter((user) => user !== currUser.displayName).concat(newUsername).join(', ');

      return Promise.all([
        update(chatroomMemberRef, {
          username: newUsername,
        }),

        update(chatRoomRef, {
          tempTitle: updatedTempTitle,
        }),
      ]);

    });
    await Promise.all(updateChatroomsPromise);
  }



  await updateProfile(currUser, {
    displayName: newUsername,
  });
}



export const changeEmail = async(db, currUser, newEmail) => {
  const userDataRef = ref(db, `users/${currUser.uid}`);
  await update(userDataRef, {
    email: newEmail,
  });
}


export const deleteAccount = async(db, currUser, chatDispatch, memberDispatch, messageDispatch, chatRoomsDispatch, navigate) => {

  navigate("/");

  const chatsInRef = ref(db, `users/${currUser.uid}/chatsIn`);
  const userRef = ref(db, `users/${currUser.uid}`);

  const chatsInSnap = await get(chatsInRef);
  const chatsInData = chatsInSnap.val();

  const memberOptions = {
    profilePictureURL: "",
    username: "Removed User",
    isOnline: false,
  }
  for (const chatID in chatsInData) {
    await removeUserFromChat(db, chatID, currUser.uid, currUser.displayName, currUser.uid, memberDispatch, chatDispatch, memberOptions);
  }


  await remove(userRef);

  await deleteUser(currUser);

  await signUserOut(auth, chatDispatch, memberDispatch, messageDispatch, chatRoomsDispatch);


}

