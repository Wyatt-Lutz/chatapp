import { useState, useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import PasswordReset from "./PasswordReset/PasswordReset";
import { validateSignin } from "../../utils/validation/signinValidation";
import { useToast } from "../../context/ToastContext";
import { auth } from "../../firebase";

const Signin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [passReset, setPassReset] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const { showToast } = useToast();
  const signUserIn = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const errors = handleValidation(trimmedEmail, trimmedPassword);
    if (errors) return;
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);

      showToast("Success!", "success");
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

  const handleChange = (e, inputName) => {
    setErrorMessage("");
    setFormErrors((prev) => ({ ...prev, [inputName]: null }));
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
    <div className="min-h-screen w-full bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      {passReset ? (
        <PasswordReset passChange={setPassReset} />
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-zinc-800/60 backdrop-blur rounded-xl shadow-lg border border-zinc-700 p-6 sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
              <p className="mt-1 text-sm text-zinc-400">
                Welcome back. Enter your credentials to continue.
              </p>
            </div>

            <form
              noValidate
              onSubmit={signUserIn}
              className="space-y-4"
              aria-label="signin-form"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange(e, "email")}
                  ref={emailRef}
                  onKeyDown={handleKeyDown}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition"
                />
                {formErrors.email && (
                  <div className="mt-1 text-sm text-rose-400" role="alert">
                    {formErrors.email}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange(e, "password")}
                  ref={passwordRef}
                  onKeyDown={handleKeyDown}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition"
                />
                {(formErrors.password || errorMessage) && (
                  <div className="mt-1 text-sm text-rose-400" role="alert">
                    {formErrors.password || errorMessage}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                Sign in
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setPassReset(true)}
                  className="text-violet-400 hover:text-violet-300 hover:underline"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-zinc-300 hover:text-white"
                >
                  Create account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Signin;
