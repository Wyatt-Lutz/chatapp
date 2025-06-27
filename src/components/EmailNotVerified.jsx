import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/providers/AuthContext";
import { useEffect, useState } from "react";
import { useRef } from "react";

const EmailNotVerified = ({ email, setIsVerified }) => {
  const { currUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const hasResentEmail = useRef(false);

  const navigate = useNavigate();
  const resendEmail = async () => {
    if (hasResentEmail.current) {
      console.info(
        "You have already tried resending the verification email, please check your email, including spam.If you think the email you entered signing up is incorrect, please click the change email button to continue to your account settings.",
      );
      return;
    }
    await sendEmailVerification(currUser);
    hasResentEmail.current = true;
    console.info("Email Verification resent"); //toast
  };

  useEffect(() => {
    const checkIfUserVerified = async () => {
      const verificationCookieId = `verification-${currUser.uid}`;
      const alreadySentVerification =
        localStorage.getItem(verificationCookieId);

      if (!currUser.emailVerified) {
        if (!alreadySentVerification) {
          await sendEmailVerification(currUser);

          localStorage.setItem(verificationCookieId, true);
          console.info("Email Verification sent"); //toast
        }
      } else if (alreadySentVerification) {
        localStorage.removeItem(verificationCookieId);
      }
      setLoading(false);
    };

    checkIfUserVerified();
  }, [currUser]);

  useEffect(() => {
    if (loading) return;
    const timeoutID = setInterval(async () => {
      await refreshUser();
      if (currUser.emailVerified) {
        setIsVerified(true);
        clearInterval(timeoutID);
      }
    }, 500);

    return () => {
      clearInterval(timeoutID);
    };
  }, [loading, currUser.emailVerified, refreshUser, setIsVerified]);

  return (
    <div>
      <div>Before you continue, please verify your email.</div>
      <div>We have sent a email verification link to {email}.</div>
      <button
        onClick={resendEmail}
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
