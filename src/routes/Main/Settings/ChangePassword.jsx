import { useContext, useState } from "react";
import { AuthContext } from "../../../AuthProvider";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useForm } from "react-hook-form";
import Close from "../../../styling-components/Close";

const ChangePassword = ({changeDisplayment}) => {
  const { currUser } = useContext(AuthContext);

  const [isPasswordsMatching, setIsPasswordsMatching] = useState(true);

  const { register, handleSubmit,  formState: { errors }, watch } = useForm();
  const oldPassword = watch('oldPassword');
  const newPassword = watch('newPassword');
  const confirmNewPassword = watch('confirmNewPassword');

  const onChangePasswordSubmit = async () => {
    if (newPassword !== confirmNewPassword) {
      setIsPasswordsMatching(false);
      return;
    }

    const credential = EmailAuthProvider.credential(currUser.email, oldPassword);
    await reauthenticateWithCredential(currUser, credential);

    await updatePassword(currUser, newPassword);
    changeDisplayment(null);
  }


  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button onClick={() => changeDisplayment(null)} className="absolute top-4 right-4"><Close /></button>
        <h2 className="mb-4 text-lg font-semibold">Change your Password</h2>

        <p>Old Password</p>
        <input type="password" {...register('oldPassword')} />
        <p>New Password</p>
        <input type="password" {...register('newPassword')} />
        <p>Confirm New Password</p>
        <input type="password" {...register('confirmNewPassword')} />

        {!isPasswordsMatching && (
          <div>Passwords do not match</div> //Toast
        )}
        <div className="flex justify-end space-x-2">
          <button onClick={() => changeDisplayment(null)} className="px-4 py-2 text-white">Cancel</button>
          <button onClick={onChangePasswordSubmit} className="px-4 py-2 text-white bg-indigo-500 rounded">Done</button>
        </div>
      </div>
    </div>




  )
}
export default ChangePassword;