import {
  get,
  onDisconnect,
  onValue,
  ref,
  remove,
  update,
} from "firebase/database";
import { useEffect } from "react";
import { db } from "../firebase";

export const useChatroomPresence = (chatID, uid) => {
  useEffect(() => {
    if (!chatID || !uid) return;

    const chatRef = ref(db, `chats/${chatID}`);
    const userMemberRef = ref(db, `members/${chatID}/${uid}`);
    const isOnlineRef = ref(db, `members/${chatID}/${uid}/isOnline`);
    const connectedRef = ref(db, ".info/connected");

    const unsubscribe = onValue(connectedRef, async (snap) => {
      if (snap.val() !== true) return;

      const chatSnap = await get(chatRef);
      if (!chatSnap.exists()) return;

      await onDisconnect(isOnlineRef).set(false);
      await update(userMemberRef, { isOnline: true });
    });

    return () => {
      unsubscribe();
      onDisconnect(isOnlineRef).cancel();
      remove(isOnlineRef);
    };
  }, [chatID, uid]);
};
