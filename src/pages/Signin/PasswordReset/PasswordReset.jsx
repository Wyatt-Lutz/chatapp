import { useState } from "react";
import { db, auth } from "../../../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { fetchUserDataByEmail } from "../../../services/userDataService";
import CheckEmail from "./CheckEmail";

const PasswordReset = ({ passChange }) => {
  const [email, setEmail] = useState("");
  const [isDisplayCheckEmail, setIsDisplayCheckEmail] = useState(false);

  const handlePasswordReset = async () => {
    const passwordCookieId = `password-${email}`;
    const previousPasswordResetTimestamp =
      localStorage.getItem(passwordCookieId);
    if (!email) {
      console.log("Please enter an email");
      return;
    }
    //if Less than 59 minutes because previous link expires in a hour
    if (
      previousPasswordResetTimestamp &&
      Date.now() - previousPasswordResetTimestamp < 3540000
    ) {
      console.log(
        `You have already received a password reset email at ${email}`,
      );
      return;
    }
    const userData = await fetchUserDataByEmail(db, email);
    console.log(userData);
    if (!userData) {
      console.info("email is not connected to any user");
      return;
    }
    await sendPasswordResetEmail(auth, email);

    localStorage.setItem(passwordCookieId, Date.now());
    setIsDisplayCheckEmail(true);

    console.info("password reset email sent");
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
        </div>
      )}
    </div>
  );
};
export default PasswordReset;
