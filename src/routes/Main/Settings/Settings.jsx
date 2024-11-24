import { useForm } from "react-hook-form";
import { changeUsername } from "../../../services/settingsDataService";
import { useContext, useState } from "react";
import { AuthContext } from "../../../AuthProvider";
import { db, actionCodeSettings } from "../../../../firebase";
import { updateEmail, sendEmailVerification } from "firebase/auth";
import ConfirmPassModal from "./ConfirmPassModal";
import EmailNotVerified from "../../../utils/EmailNotVerified";
import { changeEmail } from "../../../services/settingsDataService";

const Settings = () => {
  const { currUser } = useContext(AuthContext);

  const {register, watch} = useForm({
    defaultValues: {
      newUsername: currUser.displayName,
      newEmail: currUser.email,
    }
  });

  const [modalDisplayment, setModalDisplayment] = useState(null);

  const newUsername = watch('newUsername')
  const newEmail = watch('newEmail');
  const newPassword = watch('newPassword');
  const confirmNewPassword = watch('confirmNewPassword');

  const passwordModalHeader = "Confirm Current Password"
  const passwordModalText = "Please enter your current password to confirm these changes."





  const displayPassModal = (header, text) => {
    return new Promise((resolve) => {

      const handleModalDisplayment = (modal) => setModalDisplayment(modal);

      const handlePasswordConfirmation = (state) => {
        resolve(state);
      }

      setModalDisplayment(
        <ConfirmPassModal
          changeDisplayment={handleModalDisplayment}
          changeConfirmation={handlePasswordConfirmation}
          modalHeader={header}
          modalText={text}
        />
      )
    })
  }


  const editUsername = async() => {
    const isConfirmed = await displayPassModal(passwordModalHeader, passwordModalText);
    if (!isConfirmed) {
      return;
    }

    const isChanged = await changeUsername(db, newUsername, currUser);
    if (isChanged) {
      console.log("username changed");
    }

  }


  const editEmail = async() => {
    const isConfirmed = await displayPassModal(passwordModalHeader, passwordModalText);
    if (!isConfirmed) {
      return;
    }

    await updateEmail(currUser, newEmail);
    await sendEmailVerification(currUser, actionCodeSettings);
    setModalDisplayment(
      <EmailNotVerified
        email={currUser.email}
      />
    )
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
            <div>Username</div>
            <input type="text" {...register('newUsername')} />
            {newUsername !== currUser.displayName && (
              <button onClick={editUsername}>Save Username</button>
            )}
          </div>


          <div className="flex">
            <div>Email</div>
            <input type="email" {...register('newEmail')} />
            {newEmail !== currUser.email && (
              <button onClick={editEmail}>Save Email</button>
            )}
          </div>





          <div className="flex">
            <div>Change Password</div>
            <input type="password" {...register('newPassword')} />
            <input type="password" {...register('confirmNewPassword')}/>
            {(newPassword.length > 0 && confirmNewPassword.length > 0) && (
              <button onClick={editPassword}>Save Password</button>
            )}
          </div>




          <button onClick={() => handleModelDisplaymentChange("blockedUsers")} className="bg-gray-500">Blocked Users</button>





          <button onClick={() => handleModelDisplaymentChange("deleteAccount")} className="bg-red-500">Delete Account</button>



          {modalDisplayment}
        </>
  )
}
export default Settings;