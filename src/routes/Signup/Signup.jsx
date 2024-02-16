import { useForm } from "react-hook-form";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from "../../../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import EmailVerification from "./EmailVerification";


const Signup = () => {
  const { register, handleSubmit } = useForm();
  const [isVerify, setIsVerify] = useState(false);
  const [email, setEmail] = useState(null);

  const onSubmit = async({email, password, username}) => {
    try {
      setEmail(email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {displayName: username});
      const uid = userCredential.user.uid;
      await setDoc(doc(db, "users", uid), {
        email: email,
        username: username,
        uid: uid,
      });

      console.info('registration successful');
      setIsVerify(true);
      await sendEmailVerification(auth.currentUser);
      console.info('Email verfication sent')

      //send to home

    } catch (error) {
      console.error(error);
    }
  }


  return(
    <section>
      {isVerify ? (
        <EmailVerification email={email} />
      ) :
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <input type="text" placeholder="Username" {...register('username', { required: true, maxLength: 15 })}></input>
          <input type="email" placeholder="Email" {...register('email', { required: true, maxLength: 50 })}></input>
          <input type="password" placeholder="******" {...register('password', { required: true, maxLength: 100 })}></input>
          <div className="italic text-sm">*Must be at least 6 characters</div>
          <button type="submit" className="border rounded-md bg-zinc-500">Signup</button>
        </form>
      }

    </section>

  )
}
export default Signup;
