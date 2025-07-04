import { onChildAdded, onChildChanged, ref } from "firebase/database";
import { db } from "../../../firebase";
import { fetchUserData } from "../../services/userDataService";

export const MemberListenerService = {
  setUpMemberListeners(chatID, currUserUid, action) {
    if (!chatID) return;

    const unsubscribers = [];
    const membersRef = ref(db, `members/${chatID}`);
    if (action.onMemberAdded) {
      //This will only handle loading members when the user opens a chatroom, or adding a user to a chatroom that has never been added to it before.
      const handleMemberAdded = async (snap) => {
        const userBlockData = await fetchUserData(db, currUserUid, "blockList");
        const memberObj = {
          ...snap.val(),
          isBlocked: userBlockData[snap.key] || false,
        };
        action.onMemberAdded(snap.key, memberObj);
      };

      const memberAddedListener = onChildAdded(membersRef, handleMemberAdded);
      unsubscribers.push(memberAddedListener);
    }

    if (action.onMemberUpdated) {
      //This also runs if a user who has been previously removed is re-added because their data isn't ever deleted
      const handleUpdateMember = async (snap) => {
        const userBlockData = await fetchUserData(db, currUserUid, "blockList");
        console.log(userBlockData);
        const memberObj = { ...snap.val(), isBlocked: userBlockData[snap.key] };
        action.onMemberUpdated(snap.key, memberObj);
      };

      const memberUpdatedListener = onChildChanged(
        membersRef,
        handleUpdateMember,
      );
      unsubscribers.push(memberUpdatedListener);
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  },
};
