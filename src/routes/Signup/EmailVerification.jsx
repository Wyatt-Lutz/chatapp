
import { useNavigate } from 'react-router-dom';
import { auth } from "../../../firebase";
import { sendEmailVerification } from "firebase/auth";

const EmailVerification = ({email}) => {
  const navigate = useNavigate();
  const resendEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      console.info('Email Verification resent');

    } catch(error) {
      console.error(error);
    }

  }
  return(
    <section>
      <div>We have sent a verification link to {email}</div>

      <button onClick={() => resendEmail()} className="border rounded-md bg-zinc-500 m-2 p-1">Resend Email</button>
      <button onClick={() => navigate("/signin")} className="border rounded-md bg-zinc-500 m-2 p-1">Return to Sign in</button>
    </section>


  )
}
export default EmailVerification;