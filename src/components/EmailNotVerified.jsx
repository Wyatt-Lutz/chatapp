import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/providers/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { auth } from "../../firebase";
import PopupError from "./PopupError";

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
    <div>
      <div>Before you continue, please verify your email.</div>
      <div>We have sent a email verification link to {email}.</div>
      <button
        onClick={() => checkIfSendEmail(currUser)}
        className="border rounded-md bg-zinc-500 m-2 p-1"
      >
        Resend Email
      </button>
      <button
        onClick={() => navigate("/settings")}
        className="border rounded-md bg-zinc-500 m-2 p-1"
      >
        Change Email
      </button>

      {popup && <PopupError message={popup} type="error" />}
    </div>
  );
};

export default EmailNotVerified;
