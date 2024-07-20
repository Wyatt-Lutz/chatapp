import { useForm } from "react-hook-form";
import { changeUsername } from "../../../services/settingsDataService";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../AuthProvider";
import { db } from "../../../../firebase";
import { reauthenticateWithCredential, updateEmail, verifyBeforeUpdateEmail } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import EmailNotVerified from "../../../utils/EmailNotVerified";
import ChangeEmail from "./ChangeEmail";
import ChangePassword from "./ChangePassword";
import ChangeUsername from "./ChangeUsername";
import DeleteAccount from "./DeleteAccount";

const Settings = () => {
  const { currUser } = useContext(AuthContext);
  const [isDisplayingVerification, setIsDisplayingVerification] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleVerifyChange = (state) => {
    setIsDisplayingVerification(state);
  }

  const changeUsernameDisplayment = (state) => {
    setIsChangingUsername(state);
  }

  const changeEmailDisplayment = (state) => {
    setIsChangingEmail(state);
  }

  const changePasswordDisplayment = (state) => {
    setIsChangingPassword(state);
  }

  const changeDeletingAccountDisplayment = (state) => {
    setIsDeletingAccount(state);
  }

  return (
    <>
      {isDisplayingVerification ? (
        <EmailNotVerified verifyChange={handleVerifyChange} email={newEmail} isUpdatingEmail={true} />
      ) : (
        <>
          <h1>Settings</h1>

          <h2>My Account</h2>

          <div className="flex">
            <img alt="PFP"/>
            <div>{currUser.displayName}</div>
          </div>

          <div className="flex">
            <div>
              <div>Username</div>
              <div>{currUser.displayName}</div>
            </div>
            <button onClick={() => setIsChangingUsername(true)} className="bg-gray-500">Edit</button>
          </div>

          <div className="flex">
            <div>
              <div>Email</div>
              <div>{currUser.email}</div>
            </div>
            <button onClick={() => setIsChangingEmail(true)} className="bg-gray-500">Edit</button>
          </div>

          <div className="flex">
            <div>
              <div>Password</div>
              <div>******</div>
            </div>
            <button onClick={() => setIsChangingPassword(true)} className="bg-gray-500">Change</button>
          </div>



          <button onClick={() => setIsDeletingAccount(true)} className="bg-red-500">Delete Account</button>

          {isChangingUsername && (
            <ChangeUsername changeUsernameDisplayment={changeUsernameDisplayment} />
          )}
          {isChangingEmail && (
            <ChangeEmail changeEmailDisplayment={changeEmailDisplayment} />
          )}
          {isChangingPassword && (
            <ChangePassword changePasswordDisplayment={changePasswordDisplayment} />
          )}
          {isDeletingAccount && (
            <DeleteAccount changeDeletingAccountDisplayment={changeDeletingAccountDisplayment} />
          )}

        </>

      )}
    </>




    //change email


    //change password

    //change pfp

    //delete account
  )
}
export default Settings;