import { useForm } from "react-hook-form";
import { db, auth } from "../../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

import { ref, query, get, orderByChild, equalTo } from 'firebase/database'


const PasswordReset = ({passChange}) => {
  const { register, handleSubmit } = useForm();
  const onSubmit = async ({email}) => {
    try {
      const emailsRef = query(ref(db, "users"), orderByChild('email'), equalTo(email));
      get(emailsRef).then((snap) => {
        if (!snap.exists() || snap.val() == null) {
          console.info('no account with that email') //toast
          return;
        }
      })

      await sendPasswordResetEmail(auth, email);
      console.info('password reset email send') //toast
      passChange(false);


    } catch (error) {
      console.error(error);
    }

  }

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <input type="email" placeholder="Email" {...register('email', { required: true, maxLength: 50 })}></input>
        <button type="submit" className="border rounded-md bg-zinc-500">Signup</button>
      </form>
      <button onClick={() => passChange(false)} className="border rounded-md bg-zinc-500 m-2 p-1">Return to Signin</button>
    </section>

  )
}
export default PasswordReset;