import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/providers/AuthContext";

const EmailNotVerified = ({ email }) => {

  const { currUser } = useAuth();

  const navigate = useNavigate();
  const resendEmail = async () => {
    try {
      await sendEmailVerification(currUser);
      console.info("Email Verification resent");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div>Before you continue, please verify your email.</div>
      <div>We have sent a email verification link to {email}.</div>
      <button
        onClick={() => resendEmail()}
        className="border rounded-md bg-zinc-500 m-2 p-1"
      >
        Resend Email
      </button>
      <button onClick={() => navigate("/settings")} className="border rounded-md bg-zinc-500 m-2 p-1">Change Email</button>
    </div>
  );
};

export default EmailNotVerified;
