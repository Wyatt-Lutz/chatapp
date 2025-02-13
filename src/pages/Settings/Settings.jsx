import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../../../firebase";
import ConfirmPassModal from "./modals/ConfirmPassModal";
import EmailNotVerified from "../../components/EmailNotVerified";
import BlockedUsersModal from "./modals/BlockedUsersModal";
import { useNavigate } from "react-router-dom";
import DeleteAccount from "./Components/DeleteAccount";
import ChangePassword from "./Components/ChangePassword";
import ChangeEmail from "./Components/ChangeEmail";
import ChangeUsername from "./Components/ChangeUsername";
import ChangeProfilePicture from "./Components/ChangeProfilePicture";

const Settings = () => {
  console.log('settings run')
  const { currUser } = useContext(AuthContext);
  const navigate = useNavigate();


  const [modal, setModal] = useState({ type: null, props: {} });




  const passwordModalHeader = "Confirm Current Password"
  const passwordModalText = "Please enter your current password to confirm these changes."





  const displayPassModal = (header, text, isDeleteAccount = false) => {

    return new Promise((resolve) => {
      setModal({
        type: "ConfirmPassModal",
        props: {
          changeDisplayment: () => setModal({ type: null, props: {} }),
          changeConfirmation: (confirmed) => confirmed && resolve(),
          modalHeader: header,
          modalText: text,
          isDeleteAccount: isDeleteAccount,
        }
      });
    });
  }

  return (
        <>
          <h1>Settings</h1>

          <h2>My Account</h2>

          <div className="flex">
            <img alt="PFP"/>
            <div>{currUser.displayName}</div>
          </div>




          <ChangeUsername db={db} currUser={currUser} displayPassModal={displayPassModal} passwordModalHeader={passwordModalHeader} passwordModalText={passwordModalText} /> 
          <ChangeEmail db={db} currUser={currUser} displayPassModal={displayPassModal} passwordModalHeader={passwordModalHeader} passwordModalText={passwordModalText} />
          <ChangePassword currUser={currUser} displayPassModal={displayPassModal} passwordModalHeader={passwordModalHeader} passwordModalText={passwordModalText}/>
          <DeleteAccount db={db} currUser={currUser} displayPassModal={displayPassModal} />
          <ChangeProfilePicture currUser={currUser} />
          
          <button onClick={() => setModal({ type: "BlockedUsersModal", props: {changeDisplayment: () => setModal({ type: null, props: {} }) }})} className="bg-gray-500">Blocked Users</button>


          
          <button onClick={() => navigate("/")}>Go Home</button>


          {modal.type === "ConfirmPassModal" && <ConfirmPassModal {...modal.props} />}
          {modal.type === "EmailNotVerified" && <EmailNotVerified {...modal.props} />}
          {modal.type === "BlockedUsersModal" && <BlockedUsersModal {...modal.props} />}
        </>
  )
}
export default Settings;