import { deleteAccount } from "../../../services/settingsDataService";
import { useNavigate } from "react-router-dom";
import { useChatContexts } from "../../../hooks/useContexts";
import { useAuth } from "../../../context/providers/AuthContext";
import { db } from "../../../firebase";

const DeleteAccount = ({ displayPassModal }) => {
  const { chatroomsDispatch, resetAllChatContexts } = useChatContexts();
  const navigate = useNavigate();
  const { currUser } = useAuth();

  const handleDeleteAccount = async () => {
    const deleteAccountHeader = "Delete your Account";
    const deleteAccountText =
      "To delete your account, please enter your current password.";

    await displayPassModal(deleteAccountHeader, deleteAccountText, true);

    await deleteAccount(db, currUser, chatroomsDispatch, resetAllChatContexts);
    navigate("/signin");
  };
  return (
    <div className="space-y-3">
      <div className="bg-zinc-800/40 p-4 rounded-md border border-zinc-700">
        <div className="text-lg font-semibold text-zinc-100">
          Delete Account
        </div>
        <div className="mt-2 text-sm text-rose-300">
          Warning: This will permanently delete all your account data.
        </div>
        <div className="mt-3 text-sm text-zinc-300">
          This action cannot be undone. You will be signed out and redirected.
        </div>
        <div className="mt-4">
          <button
            onClick={handleDeleteAccount}
            className="inline-flex items-center rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
};
export default DeleteAccount;
