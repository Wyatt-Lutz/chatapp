import { useForm } from "react-hook-form";
import { changeUsername } from "../../services/settingsDataService";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../AuthProvider";
import { db } from "../../../firebase";
import { checkIfUserExists } from "../../services/chatBarDataService";
import { reauthenticateWithCredential, updateEmail, verifyBeforeUpdateEmail } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";

const Settings = () => {
  const { currUser } = useContext(AuthContext);
  const [isUsernameAvaliable, setIsUsernameAvaliable] = useState(null);
  const [isReauthenticationNeeded, setIsReauthenticationNeeded] = useState(false);
  const { register, handleSubmit,  formState: { errors }, watch } = useForm({
    defaultValues: {
      username: currUser.displayName,
      email: currUser.email,
    }
  });

  const hasMounted = useRef(false);
  const newUsername = watch('username');
  const onChangeUsernameSubmit = async ({username}) => {
    const isChanged = await changeUsername(db, username, currUser);
    if (isChanged) {
      console.log("username changed successfully");
      setIsUsernameAvaliable(null);
    }
  }

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
      }
    });

    const ret = await updateEmail(currUser, email);
  }

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    let timeout;
    const checkUsernameValidity = async(username) => {
      console.log('checked')
      const userData = await checkIfUserExists(db, username);
      if (userData) {
        setIsUsernameAvaliable(false);
        return;
      }
      setIsUsernameAvaliable(true);
    }

    const debounceUsernameValidity = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        checkUsernameValidity(newUsername);
      }, 500)
    }
    if (newUsername) {
      debounceUsernameValidity();
    } else {
      setIsUsernameAvaliable(null);
    }

    return () => clearTimeout(timeout)
  }, [newUsername])
  return (
    <div>
      <h1>Settings</h1>

      <h2>Change Username</h2>
      <form onSubmit={handleSubmit(onChangeUsernameSubmit)}>
        <input type="text" {...register('username')}  />
      </form>
      {isUsernameAvaliable === true && (
        <div className="text-green-500">Username is Avaliable</div>
      )}
      {isUsernameAvaliable === false && (
        <div className="text-red-500">Username is not avaliable. Consider adding numbers and special characters.</div>
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



    </div>




    //change email


    //change password

    //change pfp

    //delete account
  )
}
export default Settings;