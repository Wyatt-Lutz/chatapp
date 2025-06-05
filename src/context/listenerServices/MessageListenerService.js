import { limitToLast, onChildAdded, onChildChanged, onChildRemoved, orderByChild, query, ref, startAt } from "firebase/database";
import { db } from "../../../firebase";

export const MessageListenerService = {

  setUpMessageListeners(chatID, endTimestamp, action) {
    console.log(endTimestamp);
    const unsubscribers = [];
    const chatsRef = ref(db, `messages/${chatID}/`);
    const baseListenerQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp));

    const notificationSound = new Audio("/notification.mp3");

    if (action.onMessageAdded) {

      const addedListenerQuery = query(baseListenerQuery, limitToLast(15));

      const handleMessageAdded = (snap) => {
        action.onMessageAdded(snap.key, snap.val());

        if (document.hidden) {
          notificationSound.play();
        }
      }


      const chatAddedListener = onChildAdded(addedListenerQuery, handleMessageAdded);
      unsubscribers.push(chatAddedListener);

    }

    if (action.onMessageEdited) {
      const handleMessageEdited = (snap) => {
        action.onMessageEdited(snap.key, snap.val());
      }

      const messageEditedListener = onChildChanged(baseListenerQuery, handleMessageEdited);
      unsubscribers.push(messageEditedListener);
    }

    if (action.onMessageDeleted) {
      const handleMessageDeleted = (snap) => {
        action.onMessageDeleted(snap.key);
      }

       const messageRemovedListener = onChildRemoved(baseListenerQuery, handleMessageDeleted);
       unsubscribers.push(messageRemovedListener);
    }


    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    }
  }

};
