import { deleteUser, updateProfile } from "firebase/auth";

import { update, ref, remove } from "firebase/database";
import { fetchMembersFromChat, removeUserFromChat } from "./memberDataService";
import { signUserOut } from "../utils/userUtils";
import { auth, storage } from "../../firebase";
import { fetchChatRoomData } from "./chatBarDataService";
import { updateTempTitle } from "../utils/chatroomUtils";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { checkIfUsernameExists, fetchUserData } from "./userDataService";

export const changeUsername = async (
  db,
  newUsername,
  currUser,
  chatroomsData,
) => {
  const usernameExists = await checkIfUsernameExists(db, newUsername);
  if (usernameExists) {
    console.log("username already exists");
    return;
  }

  const oldUsername = currUser.displayName;

  const currUserDataRef = ref(db, `users/${currUser.uid}`);

  await update(currUserDataRef, {
    username: newUsername,
    lastUsernameChange: Date.now(),
  });

  await updateProfile(currUser, {
    displayName: newUsername,
  });

  let chatroomUids = [...chatroomsData.keys()];
  if (chatroomUids.length < 1) {
    const chatsInData = await fetchUserData(db, currUser.uid, "chatsIn");
    if (!chatsInData) {
      return;
    } else {
      chatroomUids = Object.keys(chatsInData);
    }
  }

  const updateChatroomsPromise = chatroomUids.map(async (chatID) => {
    const chatroomMemberRef = ref(db, `members/${chatID}/${currUser.uid}`);
    const chatroomDataRef = ref(db, `chats/${chatID}`);
    const { tempTitle } = await fetchChatRoomData(db, chatID);
    const newServerTempTitle = updateTempTitle(
      tempTitle,
      oldUsername,
      newUsername,
    );

    return Promise.all([
      update(chatroomMemberRef, {
        username: newUsername,
      }),

      update(chatroomDataRef, {
        tempTitle: newServerTempTitle,
      }),
    ]);
  });
  await Promise.all(updateChatroomsPromise);
};

export const changeEmail = async (db, currUser, newEmail) => {
  const userDataRef = ref(db, `users/${currUser.uid}`);
  await update(userDataRef, {
    email: newEmail,
  });
};

export const deleteAccount = async (
  db,
  currUser,
  chatroomsDispatch,
  resetAllChatContexts,
) => {
  const userRef = ref(db, `users/${currUser.uid}`);

  const chatsInData = await fetchUserData(db, currUser.uid, "chatsIn");

  if (chatsInData) {
    const memberOptions = {
      profilePictureURL: "",
      username: "Removed User",
      isOnline: false,
    };

    const removeUserFromEachChat = Object.keys(chatsInData).map(
      async (chatID) => {
        const [chatroomData, memberData] = await Promise.all([
          fetchChatRoomData(db, chatID),
          fetchMembersFromChat(db, chatID),
        ]);

        const transformedMemberData = Object.entries(memberData);

        removeUserFromChat(
          db,
          { ...chatroomData, chatID },
          currUser.uid,
          currUser.displayName,
          currUser.uid,
          resetAllChatContexts,
          transformedMemberData,
          memberOptions,
        );
      },
    );
    await Promise.all(removeUserFromEachChat);
  }

  if (currUser.photoURL !== "/default-profile.jpg") {
    const profilePictureRef = storageRef(storage, `users/${currUser.uid}`);
    await deleteObject(profilePictureRef);
  }

  await remove(userRef);
  await deleteUser(currUser);
  await signUserOut(auth, resetAllChatContexts, chatroomsDispatch);
};
