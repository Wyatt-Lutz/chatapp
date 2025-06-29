import { useState } from "react";
import { db, auth } from "../../../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { fetchUserDataByEmail } from "../../../services/userDataService";
import CheckEmail from "./CheckEmail";
import { useToast } from "../../../context/ToastContext";
import PopupError from "../../../components/PopupError";

const PasswordReset = ({ passChange }) => {
  const [email, setEmail] = useState("");
  const [isDisplayCheckEmail, setIsDisplayCheckEmail] = useState(false);
  const { showToast } = useToast();
  const [popup, setPopup] = useState("");

  const handlePasswordReset = async () => {
    const passwordCookieId = `password-${email}`;
    const previousPasswordResetTimestamp =
      localStorage.getItem(passwordCookieId);
    if (!email) {
      setPopup("Please enter an email.");
      return;
    }
    //if Less than 59 minutes because previous link expires in a hour
    if (
      previousPasswordResetTimestamp &&
      Date.now() - previousPasswordResetTimestamp < 3540000
    ) {
      const timeDifference = new Date(
        Date.now() - previousPasswordResetTimestamp,
      );
      setPopup(
        `You should have already received a password reset email at ${email}. Try again in ${60 - timeDifference.getMinutes()} minutes.`,
      );
      return;
    }
    const userData = await fetchUserDataByEmail(db, email);
    if (!userData) {
      setPopup("This email is not connected with any user.");
      return;
    }

    localStorage.setItem(passwordCookieId, Date.now());
    setIsDisplayCheckEmail(true);
    await sendPasswordResetEmail(auth, email).catch(() => {
      if (error.code === "auth/too-many-requests") {
        setPopup(
          "You are trying to send too many emails. Please check you email for the latest password reset email or wait a few minutes and reload the page before trying again.",
        );
      } else {
        setPopup(
          "Error when sending password reset email: " +
            error.message +
            " Please wait a few minutes and reload the page before trying again.",
        );
      }
      return;
    });
    showToast("Sent password reset email.", "success");
  };

  return (
    <div>
      {isDisplayCheckEmail ? (
        <CheckEmail email={email} />
      ) : (
        <div>
          <div className="flex flex-col">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handlePasswordReset}
              className="border rounded-md bg-zinc-500"
            >
              Send Reset Email
            </button>
          </div>

          <button
            onClick={() => passChange(false)}
            className="border rounded-md bg-zinc-500 m-2 p-1"
          >
            Return to Signin
          </button>
          {popup && <PopupError message={popup} type="error" />}
        </div>
      )}
    </div>
  );
};
export default PasswordReset;
