import { useEffect } from "react";
import { sendEmailVerification } from "firebase/auth";
import { actionCodeSettings, auth } from "../../firebase";

const EmailNotVerified = ({ verifyChange, email }) => {
  const currUser = auth.currentUser;
  const resendEmail = async () => {
    try {
      await sendEmailVerification(currUser, actionCodeSettings);
      console.info("Email Verification resent");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const checkIfVerified = () => {
      currUser.reload().then(() => {
        if (currUser.emailVerified) {
          localStorage.removeItem('alreadySentVerification');
          verifyChange(false);

        } else {
          setTimeout(checkIfVerified, 1000);
        }
      });
    };

    checkIfVerified();
  }, [currUser]);

  return (
    <section>
      <div>Before you continue, please verify your email.</div>
      <div>We have sent a email verification link to {email}.</div>
      <button
        onClick={() => resendEmail()}
        className="border rounded-md bg-zinc-500 m-2 p-1"
      >
        Resend Email
      </button>
      <button className="border rounded-md bg-zinc-500 m-2 p-1">Change Email</button>
    </section>
  );
};

export default EmailNotVerified;
