
import { deleteUser, updateProfile } from "firebase/auth";

import { get, update, ref} from "firebase/database";
import { checkIfUserExists } from "./globalDatService";

export const changeUsername = async(db, newUsername, currUser) => {
  const userData = await checkIfUserExists(db, newUsername);
  if (userData) {
    console.log('username already exists');
    return false;
  }


  const currUserDataRef = ref(db, `users/${currUser.uid}`);
  await update(currUserDataRef, {
    username: newUsername,
    lastUsernameChange: Date.now(),
  });

  const chatsInRef = ref(db, `users/${currUser.uid}/chatsIn`);
  const chatsInSnap = await get(chatsInRef);
  if (chatsInSnap.val()) {
    const chatroomIds = Object.keys(chatsInSnap.val());
    await Promise.all(
      chatroomIds.map(async (chatroomID) => {
        const chatroomMemberRef = ref(db, `members/${chatroomID}/${currUser.uid}`);
        const chatRoomRef = ref(db, `chats/${chatroomID}`);
        const chatRoomDataSnap = await get(chatRoomRef);
        const chatRoomData = chatRoomDataSnap.val();
        const tempTitle = chatRoomData.tempTitle;
        const updatedTempTitle = tempTitle.split(', ').filter((user) => user !== currUser.displayName).concat(newUsername).join(', ');
        update(chatroomMemberRef, {
          username: newUsername,
        });

        update(chatRoomRef, {
          tempTitle: updatedTempTitle,
        });


      })
    );
  }


  updateProfile(currUser, {
    displayName: newUsername,
  });





  return true;
}



export const changeEmail = async(db, currUser, newEmail) => {
  const userDataRef = ref(db, `users/${currUser.uid}`);
  await update(userDataRef, {
    email: newEmail,
  });
}


export const deleteAccount = async(db, currUser) => {



  await deleteUser(currUser);





  //remove user data except for username and make it user deleted
  //and transfer ownership in owned chats
}

