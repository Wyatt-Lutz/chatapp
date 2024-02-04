import { useForm } from "react-hook-form";
import { useState } from "react"
import { db, auth } from "../../firebase";
import { signInWithEmailAndPassword, setPersistence, fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";
import { setDoc, doc, collection, getDocs } from "firebase/firestore";

const Signin = () => {
  const { register, handleSubmit } = useForm();
  const [passReset, setPassReset] = useState(false);

  const handlePassChange = (state) => {
    setPassReset(state);
  }


  const onSubmit = async ({email, password}) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.info("signin successful");


      /*
      await setPersistence(auth, browserLocalPersistence);
      */

    } catch (error) {
      console.error(error);
    }
  }



  return(
    <section>
      {passReset ? (
        <PasswordReset passChange={handlePassChange}/>
      ) : (
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <input type="email" placeholder="Email" {...register('email', { required: true })}></input>
            <input type="password" placeholder="******" {...register('password', { required: true })}></input>
            <button type="submit" className="border rounded-md bg-zinc-500">Signup</button>
          </form>
          <button onClick={() => setPassReset(true)}>Forgot Password?</button>
        </div>


      )}

    </section>
  )
}
export default Signin;







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
    </section>

  )
}