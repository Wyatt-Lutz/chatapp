import { onChildAdded, onChildChanged, ref } from "firebase/database";
import { db } from "../../../firebase";
import { getBlockData } from "../../services/memberDataService";

export const MemberListenerService = {
  setUpMemberListeners(chatID, currUserUid, action) {
    if (!chatID) return;

    const unsubscribers = [];
    const membersRef = ref(db, `members/${chatID}`);

    if (action.onMemberAdded) {
      const handleMemberAdded = async (snap) => {
        const userBlockData = await getBlockData(db, currUserUid);
        const memberObj = { ...snap.val(), isBlocked: userBlockData[snap.key] };
        action.onMemberAdded(snap.key, memberObj);
      };

      const memberAddedListener = onChildAdded(membersRef, handleMemberAdded);
      unsubscribers.push(memberAddedListener);
    }

    if (action.onMemberUpdated) {
      const handleUpdateMember = (snap) => {
        action.onMemberUpdated(snap.key, snap.val(), currUserUid);
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
