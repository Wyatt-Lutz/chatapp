import { updatePassword } from "firebase/auth";
import { useAuth } from "../../../context/providers/AuthContext";
import { useState, useRef } from "react";
import PopupError from "../../../components/PopupError";

const ChangePassword = ({
  displayPassModal,
  passwordModalHeader,
  passwordModalText,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { currUser } = useAuth();
  const [popup, setPopup] = useState("");
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const changePassword = async (e) => {
    e.preventDefault();
    if (!currUser.emailVerified) {
      setPopup(
        "You have not yet verified your email. To change your password with verifying your email, please Log out and continue with the Reset Password button on the Sign In page.",
      );
      return;
    }
    if (password !== confirmPassword) {
      setPopup(
        "The two passwords do not match, please make sure they match to change your password.",
      );
      return;
    }

    await displayPassModal(passwordModalHeader, passwordModalText);

    await updatePassword(currUser, password).catch((error) => {
      if (error.code === "auth/weak-password") {
        setPopup(
          "Your new password must be at least 6 characters long and strong. Please choose a stronger password.",
        );
      } else if (error.code === "auth/requires-recent-login") {
        return;
      } else {
        setPopup(
          "There was an error while trying to change your password : " +
            error +
            ". Please reload the page and try again.",
        );
      }
    });
    setPassword("");
    setConfirmPassword("");
    setPopup("Your password has been successfully changed.");
  };

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter") return;

    if (password && confirmPassword) {
      await changePassword(e);
    }

    if (!password) {
      passwordRef.current.focus();
    } else if (!confirmPassword) {
      confirmPasswordRef.current.focus();
    }
  };
  return (
    <form onSubmit={changePassword} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Change password
        </label>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={passwordRef}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Confirm new password
        </label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={confirmPasswordRef}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition"
        />
      </div>

      {popup && (
        <PopupError
          message={popup}
          type={popup.toLowerCase().includes("success") ? "success" : "error"}
        />
      )}
      {password.length > 0 && confirmPassword.length > 0 && (
        <div>
          <button
            type="submit"
            disabled={password !== confirmPassword || password.length === 0}
            className="inline-flex items-center justify-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            Save password
          </button>
        </div>
      )}
    </form>
  );
};
export default ChangePassword;
