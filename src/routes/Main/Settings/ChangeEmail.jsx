import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../AuthProvider";
import { useForm } from "react-hook-form";
import { browserLocalPersistence, reauthenticateWithCredential, sendEmailVerification, setPersistence, signInWithEmailAndPassword, updateEmail, verifyBeforeUpdateEmail } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import { changeEmail } from "../../../services/settingsDataService";
import { auth } from "../../../../firebase";
import Close from "../../../styling-components/Close";

const ChangeEmail = ({changeEmailDisplayment}) => {
  const { currUser } = useContext(AuthContext);

  const { register, handleSubmit,  formState: { errors }, watch } = useForm();
  const hasMounted = useRef(false);
  const [isDisplayingVerification, setIsDisplayingVerification] = useState(false);
  const newEmail = watch('email');
  const password = watch('password');

  const onChangeEmailSubmit = async () => {
    setIsDisplayingVerification(true);
    //Re-authenticate user
    await setPersistence(auth, browserLocalPersistence);
    console.log(currUser.email);
    console.log(password);
    const credential = EmailAuthProvider.credential(currUser.email, password);
    console.log(credential);
    const userCredential = await reauthenticateWithCredential(currUser, credential);
    console.log(userCredential);

    await verifyBeforeUpdateEmail(userCredential.user, newEmail);
  }
/*
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    let timeout;
    const checkIfVerified = async () => {
      await currUser.reload();
      if (currUser.email === newEmail) {

        await changeEmail(db, currUser, newEmail);
        changeEmailDisplayment(false);
      } else {
        timeout = setTimeout(checkIfVerified, 1000);
      }

    };

    if (isDisplayingVerification) {
      checkIfVerified();
    }


    return () => clearTimeout(timeout);


  }, [isDisplayingVerification]);
*/

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button onClick={() => changeEmailDisplayment(false)} className="absolute top-4 right-4"><Close /></button>
        {isDisplayingVerification ? (
          <>
            <h2 className="mb-4 text-lg font-semibold">Please Verify Your New Email</h2>
            <div>You email has been successfully changed. Before you continue, please verify your email.</div>
            <div>We have sent a email verification link to {newEmail}.</div>
            <div>After your email is verified, you will have re-sign in for security</div>


            <div className="flex justify-end space-x-2">
              <button onClick={() => changeEmailDisplayment(false)} className="px-4 py-2 text-white">Cancel</button>
              <button onClick={() => {verifyBeforeUpdateEmail(currUser, newEmail)}}>Resend Email</button>
            </div>


          </>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-semibold">Change your Email</h2>

            <p>New Email</p>
            <input type="text" {...register('email')} />
            <p>Current Password</p>
            <input type="password" {...register('password')} />


            <div className="flex justify-end space-x-2">
              <button onClick={() => changeEmailDisplayment(false)} className="px-4 py-2 text-white">Cancel</button>
              <button onClick={onChangeEmailSubmit} className="px-4 py-2 text-white bg-indigo-500 rounded">Done</button>
            </div>
          </>

        )}


      </div>

    </div>
  )
}
export default ChangeEmail;