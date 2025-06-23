import { deleteUser, updateProfile } from "firebase/auth";

import { update, ref, remove } from "firebase/database";
import { queryUsernames } from "./globalDataService";
import {
  fetchChatsInData,
  fetchMembersFromChat,
  removeUserFromChat,
} from "./memberDataService";
import { signUserOut } from "../utils/userUtils";
import { auth } from "../../firebase";
import { fetchChatRoomData } from "./chatBarDataService";
import { updateTempTitle } from "../utils/chatroomUtils";

export const changeUsername = async (
  db,
  newUsername,
  currUser,
  chatroomsData,
  chatroomsDispatch,
) => {
  const userData = await queryUsernames(db, newUsername);
  if (userData) {
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
    const chatsInData = await fetchChatsInData(db, currUser.uid);
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
  chatDispatch,
  chatroomsDispatch,
  navigate,
  resetAllChatContexts,
  messageDispatch,
) => {
  const userRef = ref(db, `users/${currUser.uid}`);

  const chatsInData = await fetchChatsInData(db, currUser.uid);

  const memberOptions = {
    profilePictureURL: "",
    username: "Removed User",
    isOnline: false,
  };
  for (const chatID in chatsInData) {
    const chatroomData = await fetchChatRoomData(db, chatID);
    const memberData = Object.entries(await fetchMembersFromChat(db, chatID));

    await removeUserFromChat(
      db,
      { ...chatroomData, chatID },
      currUser.uid,
      currUser.displayName,
      currUser.uid,
      chatDispatch,
      resetAllChatContexts,
      memberData,
      messageDispatch,
      memberOptions,
    );
  }

  await remove(userRef);

  await deleteUser(currUser);

  await signUserOut(auth, resetAllChatContexts, chatroomsDispatch);
  navigate("/signin");
};
