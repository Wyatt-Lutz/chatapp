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
    <>
      <form onSubmit={changePassword} className="flex">
        <label>Change Password</label>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={passwordRef}
        />
        <input
          type="password"
          placeholder="Confirm new password "
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={confirmPasswordRef}
        />
        {popup && <PopupError message={popup} type="error" />}
        {password.length > 0 && confirmPassword.length > 0 && (
          <button disabled={password !== confirmPassword}>Save Password</button>
        )}
      </form>
    </>
  );
};
export default ChangePassword;
