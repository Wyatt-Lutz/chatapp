import { useForm } from "react-hook-form";
import { changeUsername, deleteAccount, changeEmail } from "../../services/settingsDataService";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../../../firebase";
import { updateEmail, sendEmailVerification, updatePassword } from "firebase/auth";
import ConfirmPassModal from "./modals/ConfirmPassModal";
import EmailNotVerified from "../../components/EmailNotVerified";
import UsernameAvailability from "../../components/UsernameAvailability";
import BlockedUsersModal from "./modals/BlockedUsersModal";
import { useNavigate } from "react-router-dom";
import DeleteAccount from "./Components/DeleteAccount";
import ChangePassword from "./Components/ChangePassword";

const Settings = () => {
  console.log('settings run')
  const { currUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const {register, watch} = useForm({
    defaultValues: {
      newUsername: currUser.displayName,
      newEmail: currUser.email,

    }
  });

  const [modal, setModal] = useState({ type: null, props: {} });
  const [isEditUsernameDisabled, setIsEditUsernameDisabled] = useState(false);

  const newUsername = watch('newUsername')
  const newEmail = watch('newEmail');


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


  const editUsername = async() => {
    await displayPassModal(passwordModalHeader, passwordModalText);

    const isChanged = await changeUsername(db, newUsername, currUser);
    if (isChanged) {
      console.log("username changed");
    }

  }


  const editEmail = async() => {
    await displayPassModal(passwordModalHeader, passwordModalText);

    await updateEmail(currUser, newEmail);
    await sendEmailVerification(currUser);

    setModal({
      type: "EmailNotVerified",
      props: {
        email: currUser.email,
      }
    });

    await changeEmail(db, currUser, newEmail);
  }






  return (
        <>
          <h1>Settings</h1>

          <h2>My Account</h2>

          <div className="flex">
            <img alt="PFP"/>
            <div>{currUser.displayName}</div>
          </div>


          <div className="flex">
            <label>Username</label>
            <input type="text" {...register('newUsername')} />

            {newUsername !== currUser.displayName && (
              <div>
                <UsernameAvailability newUsername={newUsername} setIsButtonDisabled={setIsEditUsernameDisabled} />
                <button disabled={isEditUsernameDisabled} onClick={editUsername}>Save Username</button>
              </div>

            )}
          </div>


          <div className="flex">
            <label>Email</label>
            <input type="email" {...register('newEmail')} />
            {newEmail !== currUser.email && (
              <button onClick={editEmail}>Save Email</button>
            )}
          </div>




          <ChangePassword currUser={currUser} displayPassModal={displayPassModal} passwordModalHeader={passwordModalHeader} passwordModalText={passwordModalText}/>
          <DeleteAccount db={db} currUser={currUser} displayPassModal={displayPassModal} />


            
          <button onClick={() => setModal({ type: "BlockedUsersModal", props: {changeDisplayment: () => setModal({ type: null, props: {} }) }})} className="bg-gray-500">Blocked Users</button>





          
          <button onClick={() => navigate("/")}>Go Home</button>


          {modal.type === "ConfirmPassModal" && <ConfirmPassModal {...modal.props} />}
          {modal.type === "EmailNotVerified" && <EmailNotVerified {...modal.props} />}
          {modal.type === "BlockedUsersModal" && <BlockedUsersModal {...modal.props} />}
        </>
  )
}
export default Settings;