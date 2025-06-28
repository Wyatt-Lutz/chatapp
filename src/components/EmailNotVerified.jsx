import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/providers/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { useRef } from "react";
import { auth } from "../../firebase";

const EmailNotVerified = ({ email, setIsVerified }) => {
  const { currUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const hasRanInitialCheck = useRef(false);

  const fetchEmailVerificationCookies = (currUser) => {
    const json = localStorage.getItem(`verification-${currUser.uid}`);
    if (!json) return null;
    const cookieData = JSON.parse(json);
    return {
      counter: cookieData.counter,
      hasSentEmailRecently: Date.now() - cookieData.timestamp < 3540000,
    };
  };

  const sendVerificationEmail = async (currUser, counter) => {
    await sendEmailVerification(currUser).catch((error) => {
      showToast(`Error sending verification email: ${error.message}`); //Example
    });
    localStorage.setItem(
      `verification-${currUser.uid}`,
      JSON.stringify({
        timestamp: Date.now(),
        counter: counter,
      }),
    );
    showToast("Verification Email Sent", "success");
  };

  const checkIfSendEmail = async (currUser) => {
    const data = fetchEmailVerificationCookies(currUser);
    if (!data) {
      await sendVerificationEmail(currUser, 1);
      return;
    }
    const { counter, hasSentEmailRecently } = data;
    if (hasSentEmailRecently && counter >= 2) {
      console.log(
        "You have already tried resending the verification email, please check your email, including spam. If you think the email you entered signing up is incorrect, please click the change email button to continue to your account settings.",
      ); //popup
      return;
    } else if (!hasSentEmailRecently) {
      await sendVerificationEmail(currUser, 1);
    } else if (hasSentEmailRecently && counter === 1) {
      await sendVerificationEmail(currUser, 2);
    }
  };

  useEffect(() => {
    console.log("I reran");
    const checkIfUserVerified = async () => {
      if (currUser.emailVerified) {
        return;
      }
      checkIfSendEmail(currUser);
      hasRanInitialCheck.current = true;
      setLoading(false);
    };

    checkIfUserVerified();
  }, []);

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
    </div>
  );
};

export default EmailNotVerified;
