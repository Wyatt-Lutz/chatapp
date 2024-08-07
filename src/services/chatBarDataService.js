import { push, ref, set, update, get, query, orderByChild, equalTo } from "firebase/database";


export const createChat = async(db, memberUids, title, membersList, uids, currUserUid) => {
  try {
    const chatsRef = ref(db, "chats/");
    const newChatRef = push(chatsRef);
    const chatID = newChatRef.key;
    const membersRef = ref(db, "members/" + chatID);

    const newChatData = {
      title: title,
      owner: currUserUid,
      memberUids: memberUids,
    }

    await Promise.all([
      set(newChatRef, newChatData),
      set(membersRef, membersList),
    ]);

    await Promise.all(
      uids.map(uid => {
        const userChatDataRef = ref(db, "users/" + uid + "/chatsIn");
        const chatData = {[chatID]: 0};
        update(userChatDataRef, chatData)
      }),
    );



    console.info('created chat');
    return chatID
  } catch (error) {
    console.error(error);
  }



}



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



