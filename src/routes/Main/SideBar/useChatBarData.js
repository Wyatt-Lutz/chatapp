import { ref, set, update } from "firebase/database";


export const createChat = async(db, chatID, chatName, membersList, uids) => {
  try {
    const chatRoomRef = ref(db, "chats/" + chatID);
    const membersRef = ref(db, "members/" + chatID);

    await Promise.all([
      set(chatRoomRef, {
        metadata: {
          title: chatName && chatName.length > 0 ? chatName : "",
        },
        lastMessage: "",
        timestamp: 0,
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