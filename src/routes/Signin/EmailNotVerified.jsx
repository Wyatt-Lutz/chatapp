
import { auth } from "../../../firebase";
import { sendEmailVerification } from "firebase/auth";


const EmailNotVerified = ({email, verifyChange}) => {
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
      <div>Before you continue, please verify your email.</div>
      <div>We have sent a email verification link to {email}.</div>
      <button onClick={() => resendEmail()} className="border rounded-md bg-zinc-500 m-2 p-1">Resend Email</button>
      <button onClick={() => verifyChange(false)} className="border rounded-md bg-zinc-500 m-2 p-1">Return to Sign in</button>

    </section>

  )
}

export default EmailNotVerified;