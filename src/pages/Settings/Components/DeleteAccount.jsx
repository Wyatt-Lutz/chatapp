import { useContext } from "react";
import { deleteAccount } from "../../../services/settingsDataService";
import { useNavigate } from "react-router-dom";
import { useChatContexts } from "../../../hooks/useContexts";
import { ChatroomsContext } from "../../../context/providers/ChatroomsContext";

const DeleteAccount = ({displayPassModal, db, currUser}) => {

    const {chatState, chatDispatch, memberDispatch, messageDispatch, resetAllChatContexts} = useChatContexts();
    const {chatRoomsDispatch} = useContext(ChatroomsContext);
    const navigate = useNavigate();

    const handleDeleteAccount = async() => {

        const deleteAccountHeader = "Delete your Account";
        const deleteAccountText = "To delete your account, please enter your current password.";

        await displayPassModal(deleteAccountHeader, deleteAccountText, true);

        await deleteAccount(db, currUser, chatState.numOfMembers, chatDispatch, chatRoomsDispatch, navigate, resetAllChatContexts);
    }
    return (
        <>
            <button onClick={handleDeleteAccount} className="bg-red-500">Delete Account</button>
        </>
    )
}
export default DeleteAccount;
