import { deleteAccount } from "../../../services/settingsDataService";
import { useNavigate } from "react-router-dom";
import { useChatContexts } from "../../../hooks/useContexts";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../../../../firebase";
import { useAuth } from "../../../context/providers/AuthContext";

const DeleteAccount = ({ displayPassModal }) => {
  const { chatroomsDispatch, resetAllChatContexts } = useChatContexts();
  const navigate = useNavigate();
  const { currUser } = useAuth();

  const handleDeleteAccount = async () => {
    const deleteAccountHeader = "Delete your Account";
    const deleteAccountText =
      "To delete your account, please enter your current password.";

    await displayPassModal(deleteAccountHeader, deleteAccountText, true);

    if (currUser.photoURL !== "/default-profile.jpg") {
      const profilePictureRef = ref(storage, `users/${currUser.uid}`);
      await deleteObject(profilePictureRef);
    }

    await deleteAccount(db, currUser, chatroomsDispatch, resetAllChatContexts);
    navigate("/signin");
  };
  return (
    <>
      <button onClick={handleDeleteAccount} className="bg-red-500">
        Delete Account
      </button>
    </>
  );
};
export default DeleteAccount;
