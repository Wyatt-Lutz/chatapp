import { deleteUser, updateProfile } from "firebase/auth";

import { update, ref, remove } from "firebase/database";
import { queryUsernames } from "./globalDataService";
import { fetchChatsInData, removeUserFromChat } from "./memberDataService";
import { signUserOut } from "../utils/userUtils";
import { auth } from "../../firebase";
import { fetchChatRoomData } from "./chatBarDataService";

export const changeUsername = async (
  db,
  newUsername,
  currUser,
  chatroomsDispatch,
) => {
  const userData = await queryUsernames(db, newUsername);
  if (userData) {
    console.log("username already exists");
    return;
  }

  const currUserDataRef = ref(db, `users/${currUser.uid}`);
  await update(currUserDataRef, {
    username: newUsername,
    lastUsernameChange: Date.now(),
  });

  const chatsInData = await fetchChatsInData(db, currUser.uid);

  if (chatsInData) {
    const updateChatroomsPromise = Object.keys(chatsInData).map(
      async (chatID) => {
        const chatroomMemberRef = ref(db, `members/${chatID}/${currUser.uid}`);
        const chatroomDataRef = ref(db, `chats/${chatID}`);
        const { tempTitle } = await fetchChatRoomData(db, chatID);
        const updatedTempTitle = tempTitle
          .split(", ")
          .filter((user) => user !== currUser.displayName)
          .concat(newUsername)
          .join(", ");
        chatroomsDispatch({
          type: "UPDATE_TEMP_TITLE",
          payload: { key: chatID, data: updatedTempTitle },
        });
        return Promise.all([
          update(chatroomMemberRef, {
            username: newUsername,
          }),

          update(chatroomDataRef, {
            tempTitle: updatedTempTitle,
          }),
        ]);
      },
    );
    await Promise.all(updateChatroomsPromise);
  }

  await updateProfile(currUser, {
    displayName: newUsername,
  });
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
  numOfMembers,
  chatDispatch,
  chatroomsDispatch,
  navigate,
  resetAllChatContexts,
  memberData,
) => {
  navigate("/");

  const userRef = ref(db, `users/${currUser.uid}`);

  const chatsInData = await fetchChatsInData(db, currUser.uid);

  const memberOptions = {
    profilePictureURL: "",
    username: "Removed User",
    isOnline: false,
  };
  for (const chatID in chatsInData) {
    await removeUserFromChat(
      db,
      chatID,
      currUser.uid,
      currUser.displayName,
      currUser.uid,
      numOfMembers,
      chatDispatch,
      resetAllChatContexts,
      memberData,
      memberOptions,
    );
  }

  await remove(userRef);

  await deleteUser(currUser);

  await signUserOut(auth, resetAllChatContexts, chatroomsDispatch);
};
