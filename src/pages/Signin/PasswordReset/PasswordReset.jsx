import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { fetchUserDataByEmail } from "../../../services/userDataService";
import CheckEmail from "./CheckEmail";
import { useToast } from "../../../context/ToastContext";
import PopupError from "../../../components/PopupError";
import { auth, db } from "../../../firebase";

const PasswordReset = ({ passChange }) => {
  const [email, setEmail] = useState("");
  const [isDisplayCheckEmail, setIsDisplayCheckEmail] = useState(false);
  const { showToast } = useToast();
  const [popup, setPopup] = useState("");

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const passwordCookieId = `password-${email}`;
    const previousPasswordResetTimestamp =
      localStorage.getItem(passwordCookieId);
    if (!email) {
      setPopup("Please enter an email.");
      return;
    }

    const oneHourInMS = 60 * 60 * 1000;
    const timeElapsed = Date.now() - previousPasswordResetTimestamp;
    const timeRemaining = oneHourInMS - timeElapsed;

    if (timeRemaining > 0) {
      const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
      );
      setPopup(
        `You should have already received a password reset email at ${email}. Try again in ${minutes} minute(s).`,
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
    await sendPasswordResetEmail(auth, email).catch((error) => {
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
    <div className="min-h-screen w-full bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      {isDisplayCheckEmail ? (
        <CheckEmail email={email} />
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-zinc-800/60 backdrop-blur rounded-xl shadow-lg border border-zinc-700 p-6 sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Reset password
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Enter your account email to receive a reset link.
              </p>
            </div>

            <form
              onSubmit={handlePasswordReset}
              className="space-y-4"
              aria-label="password-reset-form"
            >
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                Send reset email
              </button>

              <button
                type="button"
                onClick={() => passChange(false)}
                className="w-full mt-2 inline-flex items-center justify-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition"
              >
                Return to sign in
              </button>
            </form>

            {popup && (
              <div className="mt-4">
                <PopupError message={popup} type="error" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default PasswordReset;
