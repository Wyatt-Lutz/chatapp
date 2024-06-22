import { ref, set, update } from "firebase/database";


export const createChat = async(db, chatID, title, membersList, uids, currUserUid) => {
  try {
    const chatRoomRef = ref(db, "chats/" + chatID);
    const membersRef = ref(db, "members/" + chatID);

    await Promise.all([
      set(chatRoomRef, {
        title: title,
        owner: currUserUid,
      }),
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
    // see if I can automaitcally go to the chat just created
  } catch (error) {
    console.error(error);
  }

}