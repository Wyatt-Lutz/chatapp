import { useForm } from "react-hook-form";
import { useState, useRef } from "react"
import { auth } from "../../../firebase";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import PasswordReset from "./PasswordReset";

const Signin = () => {
  const { register, formState: { errors }, handleSubmit } = useForm();
  const [passReset, setPassReset] = useState(false);
  const checkboxRef = useRef(false);
  const navigate = useNavigate();


  const handlePassChange = (state) => {
    setPassReset(state);
  }


  const signUserIn = async({email, password}) => {
    await setPersistence(auth, checkboxRef.current.checked ? browserLocalPersistence : browserSessionPersistence)
    await signInWithEmailAndPassword(auth, email, password).catch((error) => {
      if (error.code === 'auth/invalid-credential') {
        console.error('Your email and/or password are incorrect.');
      }
    });

    navigate("/");
  }

  return(
    <section>
      {passReset ? (
        <PasswordReset passChange={handlePassChange}/>
      ) : (
        <div>
          <form noValidate onSubmit={handleSubmit(signUserIn)} className="flex flex-col">
            <input type="email" placeholder="Email" {...register('email', { required: true, maxLength: 254, pattern: {value: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/, message: "Not valid email."}})} />
            <input type="password" placeholder="******" {...register('password', { required: true, maxLength: 128, minLength: {value: 6, message: "Passwords are at least 6 characters."}, pattern: {value: /^[A-Za-z0-9$!@#%^&*()_\-+=\[\]{};:'",.<>/?`~\\|]+$/, message: "Invalid use of characters inside password"} })} />
            <button type="submit" className="border rounded-md bg-zinc-500">Signin</button>
          </form>
          {errors.email?.message}
          {errors.password?.message}
          <button onClick={() => setPassReset(true)}>Forgot Password?</button>
          <input type="checkbox" ref={checkboxRef} />
          <span>Remember Me</span>
          <button onClick={() => navigate("/signup")}> Signup </button>
        </div>

      )}

    </section>
  )
}
export default Signin;