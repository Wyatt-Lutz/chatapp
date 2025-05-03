import { useForm } from "react-hook-form";
import { reauthenticateWithCredential } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import { useAuth } from "../../../context/providers/AuthContext";
import CloseModal from "../../../components/ui/CloseModal";



const ConfirmPassModal = ({ changeDisplayment, changeConfirmation, modalHeader, modalText, isDeleteAccount }) => {
  const { currUser } = useAuth();

  const { register, getValues,  formState: { errors }} = useForm();

  const onCurrPassSubmit = async() => {
    const providedPass = getValues('currPassword')
    const credential = EmailAuthProvider.credential(currUser.email, providedPass);
    await reauthenticateWithCredential(currUser, credential).then(() => {
      changeConfirmation(true);
      changeDisplayment(null);
    }).catch((error) => {

      console.error(error);
      changeConfirmation(false);
    });


  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button onClick={() => changeDisplayment(null)} className="absolute top-4 right-4"><CloseModal /></button>
        <h2 className="mb-4 text-lg font-semibold">{modalHeader}</h2>

        <p>{modalText}</p>
        <input className="border" type="password" {...register('currPassword')}  />

        <div className="flex justify-end space-x-2">
          <button onClick={() => {changeDisplayment(null); changeConfirmation(false)}} className="px-4 py-2 text-white">Cancel</button>
          {isDeleteAccount ? (
            <button onClick={onCurrPassSubmit} className="bg-red-600 rounded text-white px-4 py-2">Delete</button>
          ) : (
            <button onClick={onCurrPassSubmit} className="px-4 py-2 text-white bg-indigo-500 rounded">Done</button>
          )}

        </div>

      </div>

    </div>
  )
}
export default ConfirmPassModal;
