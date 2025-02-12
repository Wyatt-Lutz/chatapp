import { deleteAccount } from "../../../services/settingsDataService";

const DeleteAccount = () => {

    const handleDeleteAccount = async(db, currUser, displayPassModal) => {

        const deleteAccountHeader = "Delete your Account";
        const deleteAccountText = "To delete your account, please enter your current password.";

        await displayPassModal(deleteAccountHeader, deleteAccountText, true);
    
        await deleteAccount(db, currUser);
      }
    return (
        <>
            <button onClick={handleDeleteAccount} className="bg-red-500">Delete Account</button>
        </>
    )
}
export default DeleteAccount;