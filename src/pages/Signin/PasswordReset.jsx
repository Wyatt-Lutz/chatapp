import { useForm } from "react-hook-form";
import { db, auth } from "../../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

import { ref, query, get, orderByChild, equalTo } from 'firebase/database'


const PasswordReset = ({passChange}) => {
  const { register, handleSubmit } = useForm();
  const onSubmit = async ({email}) => {

    const emailsRef = query(ref(db, "users"), orderByChild('email'), equalTo(email));
    const emailsDataSnap = await get(emailsRef);
    if (!emailsDataSnap.exists()) return;
    const emailsData = emailsDataSnap.val();
    if (!emailsData) {
      console.info('no account with that email');
      return
    }
    await sendPasswordResetEmail(auth, email);
    console.info('password reset email send')
    passChange(false);

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