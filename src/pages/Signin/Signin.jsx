import { useState, useRef } from "react";
import { auth } from "../../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import PasswordReset from "./PasswordReset/PasswordReset";
import { validateSignin } from "../../utils/validation/signinValidation";

const Signin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [passReset, setPassReset] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const signUserIn = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    const errors = handleValidation(email, password);
    if (errors) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      const errorMap = {
        "auth/user-not-found":
          "The email entered does not have an associated account.",
        "auth/wrong-password": "The entered password is incorrect.",
      };
      setErrorMessage(
        errorMap[error.code] ||
          "Error signing in. Please refresh the page and try again.",
      );
      console.info("Signin Error code: " + error.code);
      console.info("Signin Error message: " + error.message);
    }
  };

  const handleValidation = (email, password) => {
    const errors = validateSignin(email, password);
    setFormErrors(errors);
    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleChange = (e) => {
    setErrorMessage("");
    setFormErrors({});
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const { email, password } = formData;
    if (email && password) {
      await signUserIn(e);
    }

    if (!email || formErrors?.email) {
      emailRef.current.focus();
    } else if (!password || formErrors?.password) {
      passwordRef.current.focus();
    }
  };

  return (
    <div>
      {passReset ? (
        <PasswordReset passChange={setPassReset} />
      ) : (
        <div>
          <form noValidate onSubmit={signUserIn} className="flex flex-col">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              ref={emailRef}
              onKeyDown={handleKeyDown}
            />
            <input
              name="password"
              type="password"
              placeholder="******"
              value={formData.password}
              onChange={handleChange}
              ref={passwordRef}
              onKeyDown={handleKeyDown}
            />
            <div>{formErrors.email || formErrors.password || errorMessage}</div>

            <button type="submit" className="border rounded-md bg-zinc-500">
              Signin
            </button>
          </form>

          <button onClick={() => setPassReset(true)}>Forgot Password?</button>
          <button onClick={() => navigate("/signup")}> Signup </button>
        </div>
      )}
    </div>
  );
};
export default Signin;
