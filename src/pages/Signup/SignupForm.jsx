import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  updateProfile,
} from "firebase/auth";
import UsernameAvailability from "../../components/UsernameAvailability";
import { useState, useRef } from "react";
import { validateSignup } from "../../utils/validation/signupValidation";
import { useNavigate } from "react-router";
import {
  checkIfUsernameExists,
  createUserData,
} from "../../services/userDataService";
import { auth, db } from "../../firebase";

const SignupForm = ({ onSubmitForm }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const checkboxRef = useRef(false);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const navigate = useNavigate();

  const onSignUserUp = async (e) => {
    if (isButtonDisabled) return;
    e.preventDefault();
    const { username, email, password } = formData;

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const errors = handleValidation(trimmedUsername, trimmedEmail, password);
    if (errors) return;

    try {
      const usernameExists = await checkIfUsernameExists(db, trimmedUsername);
      if (usernameExists) {
        throw new Error("username-already-in-use");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password,
      );

      await setPersistence(
        auth,
        checkboxRef.current.checked
          ? browserSessionPersistence
          : browserLocalPersistence,
      );

      const uid = userCredential.user.uid;

      const defaultProfilePictureURL = "/default-profile.jpg";

      await createUserData(
        db,
        uid,
        trimmedUsername,
        trimmedEmail,
        defaultProfilePictureURL,
      );
      console.log(userCredential.user);
      await updateProfile(userCredential.user, {
        displayName: trimmedUsername,
        photoURL: defaultProfilePictureURL,
      });

      onSubmitForm({
        displayName: trimmedUsername,
        userCredential: userCredential,
      });
    } catch (error) {
      const errorMap = {
        "username-already-in-use":
          "The username you entered has been taken, please choose a new one.",
        "auth/email-already-in-use": `The email address: ${trimmedEmail} is already in use, either try signing in with ${trimmedEmail} or use a different email.`,
        "auth/invalid-email": `Email address ${trimmedEmail} is invalid.`,
        "auth/operation-not-allowed": `Error during sign up.`,
        "auth/weak-password":
          "Password is not strong enough. Add additional characters including special characters and numbers.",
      };
      setErrorMessage(
        errorMap[error.code] ||
          "Error signing up, please reload the page and try again.",
      );
      console.error(error);
    }
  };

  const handleValidation = (username, email, password) => {
    const errors = validateSignup(username, email, password);
    setFormErrors(errors);
    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const { username, email, password } = formData;
    if (username && email && password) {
      await onSignUserUp(e);
    }

    if (!username || formErrors?.username) {
      usernameRef.current.focus();
    } else if (!email || formErrors?.email) {
      emailRef.current.focus();
    } else if (!password || formErrors?.password) {
      passwordRef.current.focus();
    }
  };

  const handleChange = (e, inputName) => {
    setErrorMessage("");
    setFormErrors((prev) => ({ ...prev, [inputName]: null }));
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-800/60 backdrop-blur rounded-xl shadow-lg border border-zinc-700 p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Choose a username, email, and password to get started.
            </p>
          </div>

          <form
            noValidate
            onSubmit={onSignUserUp}
            className="space-y-4"
            aria-label="signup-form"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-zinc-300"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="your username"
                value={formData.username}
                ref={usernameRef}
                onChange={(e) => handleChange(e, "username")}
                onKeyDown={handleKeyDown}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition"
              />
              <div className="mt-2">
                <UsernameAvailability
                  username={formData.username}
                  setIsButtonDisabled={setIsButtonDisabled}
                />
              </div>
              {formErrors.username && (
                <div className="mt-1 text-sm text-rose-400" role="alert">
                  {formErrors.username}
                </div>
              )}
            </div>

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
                ref={emailRef}
                value={formData.email}
                onChange={(e) => handleChange(e, "email")}
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
                ref={passwordRef}
                onChange={(e) => handleChange(e, "password")}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition"
              />
              <div className="mt-1 text-xs text-zinc-400">
                *Must be at least 6 characters.
              </div>
              {(formErrors.password || errorMessage) && (
                <div className="mt-1 text-sm text-rose-400" role="alert">
                  {formErrors.password || errorMessage}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  ref={checkboxRef}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-violet-500 focus:ring-violet-500/40"
                />
                <span className="text-zinc-300">Don&apos;t remember login</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isButtonDisabled}
              className="w-full inline-flex items-center justify-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-zinc-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="text-violet-400 hover:text-violet-300 hover:underline"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
