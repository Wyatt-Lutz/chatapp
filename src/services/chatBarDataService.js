import { push, ref, set, update, get  } from "firebase/database";


export const createChat = async(db, memberUids, title, tempTitle, membersList, uids, currUserUid) => {
  try {
    const chatsRef = ref(db, "chats/");
    const newChatRef = push(chatsRef);
    const chatID = newChatRef.key;
    const membersRef = ref(db, "members/" + chatID);

    const newChatData = {
      title: title,
      tempTitle: tempTitle,
      owner: currUserUid,
      memberUids: memberUids,
      firstMessageID: "",
    }

    await Promise.all([
      set(newChatRef, newChatData),
      set(membersRef, membersList),


      ...uids.map(uid => {
        const userChatDataRef = ref(db, "users/" + uid + "/chatsIn");
        const chatData = {[chatID]: 0};
        update(userChatDataRef, chatData)
      }),
    ]);


    console.info('created chat');
    return chatID
  } catch (error) {
    console.error(error);
  }



}

/**
 * Removes the current user's username from tempTitle to display.
 * @param {*} tempTitle
 */
export const reduceTempTitle = (tempTitle, username) => {
}

title = chatName && chatName.length > 0 ? chatName : Object.values(membersList).map(member => member.username).join(', ');

export const checkIfDuplicateChat = async(db, currUserUid, newChatMemberUids) => {
  const chatsInRef = ref(db, "users/" + currUserUid + "/chatsIn");
  const chatsInSnap = await get(chatsInRef);
  if (!chatsInSnap.exists()) {
    return false;
  }
  const chatIDs = Object.keys(chatsInSnap.val());
  for (const chatID of chatIDs) {
    console.log(chatID);
    const chatMetadataRef = ref(db, "chats/" + chatID);
    const metadataSnap = await get(chatMetadataRef);
    console.log(metadataSnap.val());
    console.log(metadataSnap.val().memberUids);
    if (metadataSnap.val().memberUids === newChatMemberUids) {
      return true;
    }
  }
  return false;
}


/**
 * Fetches metadata for a specified chatroom.
 * @param {*} db
 * @param {*} chatID
 * @returns
 */
export const fetchChatRoomData = async(db, chatID) => {
  const chatroomRef = ref(db, `chats/${chatID}`);
  const chatroomDataSnap = await get(chatroomRef);
  return chatroomDataSnap.val();
}


