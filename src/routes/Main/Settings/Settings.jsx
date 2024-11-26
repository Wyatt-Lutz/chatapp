import { useForm } from "react-hook-form";
import { changeUsername } from "../../../services/settingsDataService";
import { useContext, useState } from "react";
import { AuthContext } from "../../../AuthProvider";
import { db, actionCodeSettings } from "../../../../firebase";
import { updateEmail, sendEmailVerification, updatePassword, deleteUser } from "firebase/auth";
import ConfirmPassModal from "./ConfirmPassModal";
import EmailNotVerified from "../../../utils/EmailNotVerified";
import { changeEmail } from "../../../services/settingsDataService";
import UsernameAvaliability from "../../../utils/UsernameAvaliability";
import BlockedUsersModel from "./BlockedUsersModel";

const Settings = () => {
  const { currUser } = useContext(AuthContext);

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
    await sendEmailVerification(currUser, actionCodeSettings);
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

    await deleteUser(currUser);
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
                <UsernameAvaliability newUsername={newUsername} setIsButtonDisabled={setIsEditUsernameDisabled} />
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




          <button onClick={() => setModalDisplayment(<BlockedUsersModel changeDisplayment={setModalDisplayment} />)} className="bg-gray-500">Blocked Users</button>





          <button onClick={handleDeleteAccount} className="bg-red-500">Delete Account</button>



          {modalDisplayment}
        </>
  )
}
export default Settings;