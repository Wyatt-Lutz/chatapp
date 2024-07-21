import { useContext, useState } from "react";
import { AuthContext } from "../../../AuthProvider";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useForm } from "react-hook-form";
import Close from "../../../styling-components/Close";

const DeleteAccount = ({changeDeletingAccountDisplayment}) => {
  const { currUser } = useContext(AuthContext);



  const { register, handleSubmit,  formState: { errors }, watch } = useForm();
  const password = watch('password');


  const onDeleteAccountSubmit = async () => {
    const credential = EmailAuthProvider.credential(currUser.email, password);
    await reauthenticateWithCredential(currUser, credential);

    await deleteUser(currUser);

  }


  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button onClick={() => changeDeletingAccountDisplayment(false)} className="absolute top-4 right-4"><Close /></button>
        <h2 className="mb-4 text-lg font-semibold">Change your Password</h2>

        <div>To delete your account, please enter your current password.</div>

        <p>Password</p>
        <input type="password" {...register('password')} />

        <button className="bg-red-600">Delete</button>


        <div className="flex justify-end space-x-2">
          <button onClick={() => changeDeletingAccountDisplayment(false)} className="px-4 py-2 text-white">Cancel</button>
          <button onClick={onDeleteAccountSubmit} className="px-4 py-2 text-white bg-indigo-500 rounded">Done</button>
        </div>
      </div>

    </div>




  )
}
export default DeleteAccount;