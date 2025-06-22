import { onDisconnect, onValue, ref, remove, update } from "firebase/database";
import { useEffect } from "react";
import { db } from "../../firebase";

export const useChatroomPresence = (chatID, uid) => {
  useEffect(() => {
    if (!chatID || !uid) return;

    const userMemberRef = ref(db, `members/${chatID}/${uid}`);
    const userDataRef = ref(db, `users/${uid}/chatsIn`);
    const connectedRef = ref(db, ".info/connected");
    const isOnlineRef = ref(db, `members/${chatID}/${uid}/isOnline`);

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
  }, [chatID, uid]);
};
