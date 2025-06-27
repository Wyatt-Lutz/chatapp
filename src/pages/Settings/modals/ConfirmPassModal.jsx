import { reauthenticateWithCredential } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import { useAuth } from "../../../context/providers/AuthContext";
import CloseModal from "../../../components/ui/CloseModal";
import { useState } from "react";

const ConfirmPassModal = ({
  changeDisplayment,
  changeConfirmation,
  modalHeader,
  modalText,
  isDeleteAccount,
}) => {
  const { currUser } = useAuth();
  const [password, setPassword] = useState("");

  const onCurrPassSubmit = async (e) => {
    e.preventDefault();
    const credential = EmailAuthProvider.credential(currUser.email, password);
    await reauthenticateWithCredential(currUser, credential)
      .then(() => {
        changeConfirmation(true);
        changeDisplayment(null);
      })
      .catch((error) => {
        console.error(error); //toast (not a toast, make it a text box under where you enter your password, test the errors)
        changeConfirmation(false);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button
          onClick={() => changeDisplayment(false)}
          className="absolute top-4 right-4"
        >
          <CloseModal />
        </button>
        <h2 className="mb-4 text-lg font-semibold">{modalHeader}</h2>

        <p>{modalText}</p>
        <form onSubmit={onCurrPassSubmit}>
          <input
            className="border"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {isDeleteAccount ? (
            <button
              className="bg-red-600 rounded text-white px-4 py-2"
              type="submit"
            >
              Delete
            </button>
          ) : (
            <button
              className="px-4 py-2 text-white bg-indigo-500 rounded"
              type="submit"
            >
              Done
            </button>
          )}
        </form>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              changeDisplayment(false);
              changeConfirmation(false);
            }}
            className="px-4 py-2 text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmPassModal;
