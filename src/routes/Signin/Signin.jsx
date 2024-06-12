import { useForm } from "react-hook-form";
import { useState, useRef, useEffect} from "react"
import { auth } from "../../../firebase";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, signInWithCustomToken, browserSessionPersistence } from "firebase/auth";
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


  const signUserIn = async({email, password}, token) => {
    await setPersistence(auth, checkboxRef.current.checked ? browserLocalPersistence : browserSessionPersistence).then(() => {
      if(token) {
        return signInWithCustomToken(auth, token);
      }
      return signInWithEmailAndPassword(auth, email, password);
    });
    navigate("/");

  }



  return(
    <section>
      {passReset ? (
        <PasswordReset passChange={handlePassChange}/>
      ) : (
        <div>
          <form noValidate onSubmit={handleSubmit((data) => signUserIn(data, null))} className="flex flex-col">
            <input type="email" placeholder="Email" {...register('email', { required: true, maxLength: 254, pattern: {value: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/, message: "Not valid email."}})}></input>
            <input type="password" placeholder="******" {...register('password', { required: true, maxLength: 128, minLength: {value: 6, message: "Passwords are at least 6 characters."}, pattern: {value: /^[A-Za-z0-9$!@#%^&*()-_+=\[\]{};:'",.<>/?`~\\|]+$/, message: "Invalid use of characters inside password"} })}></input>
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