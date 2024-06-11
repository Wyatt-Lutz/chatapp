import { useForm } from "react-hook-form";
import { useState, useRef, useEffect} from "react"
import { auth } from "../../../firebase";
import { signInWithEmailAndPassword, setPersistence, sendEmailVerification, browserLocalPersistence } from "firebase/auth";
import CryptoAES from 'crypto-js/aes';
import CryptoENC from 'crypto-js/enc-utf8';
import { servKey } from "../../../envVars";
import { useNavigate } from 'react-router-dom';
import EmailNotVerified from "../../utils/EmailNotVerified";
import PasswordReset from "./PasswordReset";

const Signin = () => {
  const { register, handleSubmit } = useForm();
  const [passReset, setPassReset] = useState(false);
  const [email, setEmail] = useState(null);
  const [isVerify, setVerify] = useState(false);
  const checkboxRef = useRef(false);

  const navigate = useNavigate();



  const handlePassChange = (state) => {
    setPassReset(state);
  }

  useEffect(() => {
    ifCookieSignin();
  }, []);

  async function ifCookieSignin() {
    if (!document.cookie) {
      return;
    }
    const cookieData = await decodeCookie();
    if (cookieData) {
      const parsedData = JSON.parse(cookieData);
      const data = parsedData.cookieData;
      const [email, password] = data;
      await onSubmit({email, password});
    }
  }



  const onSubmit = async ({email, password}) => {
    try {
      setEmail(email);

      await signInWithEmailAndPassword(auth, email, password).then(() => {
        console.info("signin successful");
      });


      if (checkboxRef.current.checked) {
        await issueCookie(email, password);
      }

      await setPersistence(auth, browserLocalPersistence).then(() => {
        console.info('persistance set');
      });

      navigate('/');

    } catch (error) {
      console.error(error);
    }
  }


  async function issueCookie(email, password) {

    const expireTime = new Date(Date.now()+ 2629746000); // 1 month
    const expires = expireTime.toUTCString();

    const path = '/';
    const secure = true;
    const httpOnly = true;
    const sameSite = 'lax';

    const cookieData = [email, password];

    var encodedData = CryptoAES.encrypt(JSON.stringify({cookieData}), servKey).toString();

    document.cookie = `rememberMeToken=${encodedData};expires=${expires};path=${path};secure=${secure};sameSite=${sameSite};`;
  }

  async function decodeCookie() {
    try{
      const cookies = document.cookie;
      const [_, cookieDatas] = cookies.split('=');
      const decryptedData = CryptoAES.decrypt(cookieDatas, servKey).toString(CryptoENC);
      return decryptedData;

    } catch (error) {
      console.error(error)
    }

  }




  return(
    <section>
      {passReset ? (
        <PasswordReset passChange={handlePassChange}/>
      ) : (
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <input type="email" placeholder="Email" {...register('email', { required: true, maxLength: 50 })}></input>
            <input type="password" placeholder="******" {...register('password', { required: true, maxLength: 100 })}></input>
            <button type="submit" className="border rounded-md bg-zinc-500">Signin</button>
          </form>
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