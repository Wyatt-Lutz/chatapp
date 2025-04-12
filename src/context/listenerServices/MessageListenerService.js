import { limitToLast, onChildAdded, onChildChanged, onChildRemoved, orderByChild, query, ref, startAt } from "firebase/database";
import { db } from "../../../firebase";


export const MessageListenerService = {

  setUpMessageListeners(chatID, endTimestamp, action) {
    console.log(endTimestamp);
    const unsubscribers = [];
    const chatsRef = ref(db, `messages/${chatID}/`);
    const addedListenerQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp), limitToLast(15));
    const otherListenersQuery = query(chatsRef, orderByChild("timestamp"), startAt(endTimestamp));

    if (action.onMessageAdded) {

      const handleMessageAdded = (snap) => {
        action.onMessageAdded(snap.key, snap.val());
      }


      const chatAddedListener = onChildAdded(addedListenerQuery, handleMessageAdded);
      unsubscribers.push(chatAddedListener);

    }

    if (action.onMessageEdited) {
      const handleMessageEdited = (snap) => {
        action.onMessageEdited(snap.key, snap.val());
      }

      const messageEditedListener = onChildChanged(otherListenersQuery, handleMessageEdited);
      unsubscribers.push(messageEditedListener);
    }

    if (action.onMessageDeleted) {
      const handleMessageDeleted = (snap) => {
        action.onMessageDeleted(snap.key);
      }

       const messageRemovedListener = onChildRemoved(otherListenersQuery, handleMessageDeleted);
       unsubscribers.push(messageRemovedListener);
    }


    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    }
  }

};
