import { useForm } from "react-hook-form";
import { changeUsername } from "../../../services/settingsDataService";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../AuthProvider";
import { db } from "../../../../firebase";
import { checkIfUserExists } from "../../../services/chatBarDataService";
import { reauthenticateWithCredential, updateEmail, verifyBeforeUpdateEmail } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import EmailNotVerified from "../../../utils/EmailNotVerified";
import ChangeEmail from "./ChangeEmail";
import ChangePassword from "./ChangePassword";
import ChangeUsername from "./ChangeUsername";

const Settings = () => {
  const { currUser } = useContext(AuthContext);
  const [isReauthenticationNeeded, setIsReauthenticationNeeded] = useState(false);
  const [isDisplayingVerification, setIsDisplayingVerification] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { register, handleSubmit,  formState: { errors }, watch } = useForm({
    defaultValues: {
      username: currUser.displayName,
      email: currUser.email,
    }
  });


  const newEmail = watch('email');


  const onChangeEmailSubmit = async({email, password}) => {
    console.log(email);
    console.log(password);
    if (isReauthenticationNeeded) {
      const credential = EmailAuthProvider.credential(currUser.email, password);
      reauthenticateWithCredential(currUser, credential);
      setIsReauthenticationNeeded(false);
    }
    await verifyBeforeUpdateEmail(currUser, newEmail).catch((error) => {
      if (error === 'auth/requires-recent-login') {
        setIsReauthenticationNeeded(true);
        return;
      }
    });
    setIsDisplayingVerification(true);



    const ret = await updateEmail(currUser, email);
  }




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

          {isChangingUsername && (
            <ChangeUsername changeUsernameDisplayment={changeUsernameDisplayment} />
          )}
          {isChangingEmail && (
            <ChangeEmail changeEmailDisplayment={changeEmailDisplayment} />
          )}
          {isChangingPassword && (
            <ChangePassword changePasswordDisplayment={changePasswordDisplayment} />
          )}






          <h2>Change Email</h2>
          <form onSubmit={handleSubmit(onChangeEmailSubmit)}>
            <input type="text" {...register('email')} />
          </form>
          {isReauthenticationNeeded && (
            <>
              <form onSubmit={handleSubmit(onChangeEmailSubmit)}>
                <input type="password" placeholder="******" {...register('password', { required: true, maxLength: 128, minLength: {value: 6, message: "Passwords are at least 6 characters."}, pattern: {value: /^[A-Za-z0-9$!@#%^&*()_\-+=\[\]{};:'",.<>/?`~\\|]+$/, message: "Invalid use of characters inside password"} })} />
              </form>
              {errors.password?.message}
            </>
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