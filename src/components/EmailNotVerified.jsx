import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/providers/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import PopupError from "./PopupError";
import { auth } from "../firebase";

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const EmailNotVerified = ({ email, setIsVerified }) => {
  const { currUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [popup, setPopup] = useState();

  const fetchEmailVerificationCookies = (currUser) => {
    const json = localStorage.getItem(`verification-${currUser.uid}`);
    if (!json) return null;
    const cookieData = JSON.parse(json);
    return {
      counter: cookieData.counter,
      hasSentEmailRecently: Date.now() - cookieData.timestamp < ONE_HOUR_IN_MS,
    };
  };

  const sendVerificationEmail = async (currUser, counter) => {
    try {
      await sendEmailVerification(currUser);
      localStorage.setItem(
        `verification-${currUser.uid}`,
        JSON.stringify({
          timestamp: Date.now(),
          counter,
        }),
      );
      showToast("Verification Email Sent", "success");
    } catch (error) {
      if (error.code === "auth/too-many-requests") {
        setPopup(
          "You are trying to send too many emails. Please check you email for the latest verification links or wait a few minutes and reload the page before trying again.",
        );
      } else {
        setPopup(
          "Error when sending verification email: " +
            error.message +
            " Please wait a few minutes and reload the page before trying again.",
        );
      }
    }
  };

  const handleSendEmail = async (currUser) => {
    const data = fetchEmailVerificationCookies(currUser);
    if (!data) {
      await sendVerificationEmail(currUser, 1);
      return;
    }
    const { counter, hasSentEmailRecently } = data;
    if (hasSentEmailRecently && counter >= 2) {
      setPopup(
        "You should have already received a verification email, please check your email, including spam. If you think the email you entered signing up is incorrect, please click the change email button to continue to your account settings.",
      );
      return;
    } else if (!hasSentEmailRecently) {
      await sendVerificationEmail(currUser, 1);
    } else if (hasSentEmailRecently && counter === 1) {
      await sendVerificationEmail(currUser, 2);
    }
  };

  useEffect(() => {
    if (!currUser) return;
    if (currUser.emailVerified) return;

    handleSendEmail(currUser);
    setLoading(false);
  }, [currUser]);

  useEffect(() => {
    if (loading) return;
    const timeoutID = setInterval(async () => {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setIsVerified(true);
        clearInterval(timeoutID);
      }
    }, 500);

    return () => {
      clearInterval(timeoutID);
    };
  }, [loading, setIsVerified]);

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-800/60 backdrop-blur rounded-xl shadow-lg border border-zinc-700 p-6 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md">
              <span className="text-xl font-bold">@</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Verify your email
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Before you continue, we need to confirm it&apos;s really you.
            </p>
          </div>

          <p className="text-sm text-zinc-300 mb-4">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-zinc-100">{email}</span>. Please
            check your inbox (and spam) and click the link to verify your
            account.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <button
              type="button"
              onClick={() => handleSendEmail(currUser)}
              className="flex-1 inline-flex items-center justify-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition"
            >
              Resend email
            </button>
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="flex-1 inline-flex items-center justify-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition"
            >
              Change email
            </button>
          </div>

          {popup && (
            <div className="mt-2">
              <PopupError message={popup} type="error" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailNotVerified;
