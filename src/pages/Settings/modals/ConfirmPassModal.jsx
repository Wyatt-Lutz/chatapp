import { reauthenticateWithCredential } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import { useAuth } from "../../../context/providers/AuthContext";
import CloseModal from "../../../components/ui/CloseModal";
import { useState } from "react";
import PopupError from "../../../components/PopupError";

const ConfirmPassModal = ({
  changeDisplayment,
  changeConfirmation,
  modalHeader,
  modalText,
  isDeleteAccount,
}) => {
  const { currUser } = useAuth();
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState("");

  const onCurrPassSubmit = async (e) => {
    e.preventDefault();
    const credential = EmailAuthProvider.credential(currUser.email, password);
    await reauthenticateWithCredential(currUser, credential)
      .then(() => {
        changeConfirmation(true);
        changeDisplayment(null);
      })
      .catch((error) => {
        setPassword("");
        if (error.code === "auth/wrong-password") {
          setPopup("Wrong password.");
        } else {
          setPopup(
            "There was an error while trying to change your password. Please reload the page and try again.",
          );
        }
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/60 z-50">
      <div className="relative w-full max-w-md p-8 bg-zinc-800/95 rounded-xl shadow-2xl border border-zinc-700">
        <button
          onClick={() => changeDisplayment(false)}
          className="absolute top-4 right-4"
          aria-label="Close confirm password modal"
        >
          <CloseModal />
        </button>

        <h2 className="mb-2 text-xl font-semibold bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          {modalHeader}
        </h2>
        <p className="text-sm text-zinc-400 mb-4">{modalText}</p>

        <form onSubmit={onCurrPassSubmit} className="space-y-3">
          <input
            className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            type="password"
            placeholder="Current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {popup && <PopupError message={popup} type="error" />}

          <div className="flex justify-end items-center gap-3">
            <button
              onClick={() => {
                changeDisplayment(false);
                changeConfirmation(false);
              }}
              type="button"
              className="px-4 py-2 text-sm text-zinc-200 bg-zinc-700 rounded-md hover:bg-zinc-700/80"
            >
              Cancel
            </button>

            {isDeleteAccount ? (
              <button
                className="px-4 py-2 text-sm text-white bg-rose-600 rounded-md hover:bg-rose-500"
                type="submit"
              >
                Delete
              </button>
            ) : (
              <button
                className="px-4 py-2 text-sm text-white bg-indigo-500 rounded-md hover:bg-indigo-400"
                type="submit"
              >
                Done
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default ConfirmPassModal;
