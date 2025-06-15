import {
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  ref,
} from "firebase/database";
import { db } from "../../../firebase";

export const ChatroomsListenerService = {
  setUpChatroomsListeners(currUserUid, action) {
    if (!currUserUid) return;

    const unsubscribers = [];
    const chatsInRef = ref(db, `users/${currUserUid}/chatsIn`);

    if (action.onChatroomAdded) {
      const handleChatroomAdded = async (snap) => {
        action.onChatroomAdded(snap.key, snap.val());
      };

      const chatroomAddedListener = onChildAdded(
        chatsInRef,
        handleChatroomAdded,
      );
      unsubscribers.push(chatroomAddedListener);
    }

    if (action.onChatroomRemoved) {
      const handleChatroomRemoved = (snap) => {
        action.onChatroomRemoved(snap.key);
      };

      const chatroomRemovedListener = onChildRemoved(
        chatsInRef,
        handleChatroomRemoved,
      );
      unsubscribers.push(chatroomRemovedListener);
    }

    if (action.onUpdateUnread) {
      const handleUpdateUnread = (snap) => {
        action.onUpdateUnread(snap.key, snap.val());
      };

      const chatroomUnreadCountListener = onChildChanged(
        chatsInRef,
        handleUpdateUnread,
      );
      unsubscribers.push(chatroomUnreadCountListener);
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  },
};
