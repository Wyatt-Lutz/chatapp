import { useForm } from "react-hook-form";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from "../../../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile} from "firebase/auth";
import { ref, query, set, get, orderByChild, equalTo, onValue } from 'firebase/database'



const Signup = () => {
  const { register, formState: { errors }, handleSubmit } = useForm();

  const navigate = useNavigate();
  const onSubmit = async({email, password, username}) => {
    try {

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const trimmedUsername = username.trim()
      console.log(username.length);
      console.log(trimmedUsername.length);
      await updateProfile(userCredential.user, {displayName: trimmedUsername});

      const uid = userCredential.user.uid;

      set(ref(db, "users/" + uid), {
        username: trimmedUsername,
        email: email,
        blocked: [],
        chatsIn: [],
      });

      console.info('registration successful');

      navigate("/")

    } catch (error) {
      console.error(error);
    }
  }


  return(
    <section>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <input type="text" placeholder="Username" {...register('username', { required: {value: true, message: "Usernames are required."}, maxLength: {value: 15, message: "Usernames cannot be longer than 15 characters."} })}></input>
        <input type="email" placeholder="Email" {...register('email', { required: {value: true, message: "Emails are required."}, maxLength: {value: 254, message: "Email adresses cannot exceed 254 characters."} })}></input>
        <input type="password" placeholder="******" {...register('password', { required: {value: true, message: "Passwords are required."}, maxLength: {value: 128, message: "Passwords cannot exceed 128 characters."} })}></input>
        <div className="italic text-sm">*Must be at least 6 characters</div>
        <button type="submit" className="border rounded-md bg-zinc-500">Signup</button>

        {errors.username?.message}
        {errors.email?.message}
        {errors.password?.message}
      </form>


      <button onClick={() => navigate("/signin")}>Signin</button>

    </section>

  )
}
export default Signup;
