import { updatePassword } from "firebase/auth";
import { useAuth } from "../../../context/providers/AuthContext";
import { useState } from "react";

const ChangePassword = ({
  displayPassModal,
  passwordModalHeader,
  passwordModalText,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { currUser } = useAuth();

  const editPassword = async () => {
    if (!currUser.emailVerified) {
      console.info(
        "You have not yet verified your email. To change your password, please use the reset password button on the signin page.", //popup (add like a to signin button)
      );
      return;
    }
    if (password !== confirmPassword) return;

    await displayPassModal(passwordModalHeader, passwordModalText);

    await updatePassword(currUser, password);
    setPassword("");
    setConfirmPassword("");
  };
  return (
    <>
      <div className="flex">
        <label>Change Password</label>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm new password "
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {password.length > 0 && confirmPassword.length > 0 && (
          <button
            disabled={password !== confirmPassword}
            onClick={editPassword}
          >
            Save Password
          </button>
        )}
      </div>
    </>
  );
};
export default ChangePassword;
