import { useForm } from "react-hook-form";
import { db, auth } from "../../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";


const PasswordReset = ({passChange}) => {
  const { register, handleSubmit } = useForm();
  const onSubmit = async ({email}) => {
    try {
      const docRef = collection(db, 'users');
      const snap = await getDocs(docRef);
      const isEmail = snap.docs.find((doc) => doc.data().email === email);
      if (isEmail) {
        await sendPasswordResetEmail(auth, email);
        console.info('password-reset email sent');
        passChange(false);

      } else {
        console.info('No account with that Email.');
      }
    } catch (error) {
      console.error(error);
    }

  }

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <input type="email" placeholder="Email" {...register('email', { required: true })}></input>
        <button type="submit" className="border rounded-md bg-zinc-500">Signup</button>
      </form>
      <button onClick={() => passChange(false)} className="border rounded-md bg-zinc-500 m-2 p-1">Return to Signin</button>
    </section>

  )
}
export default PasswordReset;