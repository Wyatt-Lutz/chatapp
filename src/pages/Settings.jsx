import { useForm } from "react-hook-form";
import { changeUsername, deleteAccount, changeEmail } from "../services/settingsDataService";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../../firebase";
import { updateEmail, sendEmailVerification, updatePassword } from "firebase/auth";
import ConfirmPassModal from "../components/ConfirmPassModal";
import EmailNotVerified from "../components/EmailNotVerified";
import UsernameAvailability from "../components/UsernameAvailability";
import BlockedUsersModal from "../components/BlockedUsersModal";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  console.log('settings run')
  const { currUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const {register, watch, resetField} = useForm({
    defaultValues: {
      newUsername: currUser.displayName,
      newEmail: currUser.email,
      newPassword: "",
      confirmNewPassword: "",
    }
  });

  const [modalDisplayment, setModalDisplayment] = useState(null);
  const [isEditUsernameDisabled, setIsEditUsernameDisabled] = useState(false);

  const newUsername = watch('newUsername')
  const newEmail = watch('newEmail');
  const newPassword = watch('newPassword');
  const confirmNewPassword = watch('confirmNewPassword');

  const passwordModalHeader = "Confirm Current Password"
  const passwordModalText = "Please enter your current password to confirm these changes."





  const displayPassModal = (header, text, isDeleteAccount) => {
    return new Promise((resolve) => {


      const handlePasswordConfirmation = (state) => {
        if (!state) {
          console.error('something went wrong') //add error handling
          return;
        }
        resolve();
      }

      setModalDisplayment(
        <ConfirmPassModal
          changeDisplayment={setModalDisplayment}
          changeConfirmation={handlePasswordConfirmation}
          modalHeader={header}
          modalText={text}
          isDeleteAccount={isDeleteAccount}
        />
      )
    })
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
    setModalDisplayment(
      <EmailNotVerified
        email={currUser.email}
      />
    )
    await changeEmail(db, currUser, newEmail);
  }


  const editPassword = async() => {
    await displayPassModal(passwordModalHeader, passwordModalText);

    await updatePassword(currUser, newPassword);
    resetField("newPassword");
    resetField("confirmNewPassword");
  }

  const handleDeleteAccount = async() => {
    const deleteAccountHeader = "Delete your Account";
    const deleteAccountText = "To delete your account, please enter your current password."
    await displayPassModal(deleteAccountHeader, deleteAccountText);

    await deleteAccount(db, currUser);
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



          <div className="flex">
            <label>Change Password</label>
            <input type="password" placeholder="New password" {...register('newPassword')} />
            <input type="password" placeholder="Confirm new password "{...register('confirmNewPassword')}/>
            {(newPassword.length > 0 && confirmNewPassword.length > 0) && (
              <button disabled={!(newPassword === confirmNewPassword)} onClick={editPassword}>Save Password</button>
            )}
          </div>




          <button onClick={() => setModalDisplayment(<BlockedUsersModal changeDisplayment={setModalDisplayment} />)} className="bg-gray-500">Blocked Users</button>





          <button onClick={handleDeleteAccount} className="bg-red-500">Delete Account</button>
          <button onClick={() => navigate("/")}>Go Home</button>


          {modalDisplayment}
        </>
  )
}
export default Settings;