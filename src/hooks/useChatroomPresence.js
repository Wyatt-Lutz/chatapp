import { onDisconnect, onValue, ref, remove, update } from "firebase/database";
import { useEffect } from "react";
import { db } from "../../firebase";

export const useChatroomPresence = (chatID, userUid) => {
  useEffect(() => {
    if (!chatID || !userUid) return;

    const userMemberRef = ref(db, `members/${chatID}/${userUid}`);
    const userDataRef = ref(db, `users/${userUid}/chatsIn`);
    const connectedRef = ref(db, ".info/connected");
    const isOnlineRef = ref(db, `members/${chatID}/${userUid}/isOnline`);

    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(isOnlineRef).remove();
        update(userMemberRef, { isOnline: true });
        update(userDataRef, { [chatID]: 0 });
      }
    });
    return () => {
      unsubscribe();
      remove(isOnlineRef);
    };
  }, [chatID, userUid]);
};
