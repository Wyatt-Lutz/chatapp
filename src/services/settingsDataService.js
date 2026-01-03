import { deleteUser, updateProfile } from "firebase/auth";

import { update, ref, remove } from "firebase/database";
import { fetchMembersFromChat, removeUserFromChat } from "./memberDataService";
import { signUserOut } from "../utils/userUtils";
import { auth, storage } from "../firebase";
import { fetchChatRoomData } from "./chatBarDataService";
import { updateMembersTitle } from "../utils/chatroomUtils";
import { deleteObject, ref as storageRef } from "firebase/storage";
import {
  checkIfUsernameExists,
  fetchUserData,
  rollBackPublicUsernameData,
  updatePublicUsername,
} from "./userDataService";

export const changeUsername = async (
  db,
  newUsername,
  currUser,
  chatroomsData,
) => {
  const usernameExists = await checkIfUsernameExists(db, newUsername);
  if (usernameExists) {
    return;
  }

  const oldUsername = currUser.displayName;

  await updatePublicUsername(db, newUsername, oldUsername);

  try {
    let chatroomUids = [...chatroomsData.keys()];

    const updateChatroomsPromise = chatroomUids.map(async (chatID) => {
      const { membersTitle } = await fetchChatRoomData(db, chatID);
      return {
        chatID,
        newMembersTitle: updateMembersTitle(
          membersTitle,
          oldUsername,
          newUsername,
        ),
      };
    });
    const chatroomData = await Promise.all(updateChatroomsPromise);

    const updates = {};

    updates[`users/${currUser.uid}/username`] = newUsername;
    updates[`users/${currUser.uid}/lastUsernameChange`] = Date.now();

    chatroomUids.forEach((chatID) => {
      updates[`members/${chatID}/${currUser.uid}/username`] = newUsername;
    });

    chatroomData.forEach(({ chatID, newMembersTitle }) => {
      updates[`chats/${chatID}/membersTitle`] = newMembersTitle;
    });

    await update(ref(db), updates);

    await updateProfile(currUser, {
      displayName: newUsername,
    });
  } catch (error) {
    await rollBackPublicUsernameData(db, newUsername, oldUsername);
  }
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
      username: "Deleted User",
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
          transformedMemberData,
          memberOptions,
        );
      },
    );
    await Promise.all(removeUserFromEachChat);
  }
  const photoURL = await fetchUserData(db, currUser.uid, "profilePictureURL");
  if (photoURL !== "/default-profile.jpg") {
    const profilePictureRef = storageRef(storage, `users/${currUser.uid}`);
    await deleteObject(profilePictureRef);
  }
  await remove(ref(db, `publicUsernames/${currUser.displayName}`));
  await remove(userRef);
  await deleteUser(currUser);
  await signUserOut(auth, resetAllChatContexts, chatroomsDispatch);
};
