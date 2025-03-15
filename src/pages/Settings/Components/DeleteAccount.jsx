import { useContext } from "react";
import { deleteAccount } from "../../../services/settingsDataService";
import { ChatContext } from "../../../context/ChatContext";
import { ChatroomsContext } from "../../../context/ChatroomsContext";
import { useNavigate } from "react-router-dom";

const DeleteAccount = ({displayPassModal, db, currUser}) => {

    const {chatDispatch, memberDispatch, messageDispatch} = useContext(ChatContext);
    const {chatRoomsDispatch} = useContext(ChatroomsContext);
    const navigate = useNavigate();

    const handleDeleteAccount = async() => {

        const deleteAccountHeader = "Delete your Account";
        const deleteAccountText = "To delete your account, please enter your current password.";

        await displayPassModal(deleteAccountHeader, deleteAccountText, true);

        await deleteAccount(db, currUser, chatDispatch, memberDispatch, messageDispatch, chatRoomsDispatch, navigate);
    }
    return (
        <>
            <button onClick={handleDeleteAccount} className="bg-red-500">Delete Account</button>
        </>
    )
}
export default DeleteAccount;