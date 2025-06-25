import { db, auth } from "../../../firebase";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  updateProfile,
} from "firebase/auth";
import UsernameAvailability from "../../components/UsernameAvailability";
import { useState } from "react";
import {
  createUserData,
  queryUsernames,
} from "../../services/globalDataService";
import { useRef } from "react";
import { validateSignup } from "../../utils/validation/signupValidation";

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

  const onSignUserUp = async (e) => {
    if (isButtonDisabled) return;
    e.preventDefault();
    handleValidation();

    try {
      const usernameQueryData = await queryUsernames(db, username);
      if (usernameQueryData) {
        throw new Error("username-already-in-use");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await setPersistence(
        auth,
        checkboxRef.current.checked
          ? browserSessionPersistence
          : browserLocalPersistence,
      );

      const trimmedUsername = username.trim();

      const uid = userCredential.user.uid;

      const defaultProfilePictureURL = "/default-profile.jpg";

      await createUserData(
        db,
        uid,
        trimmedUsername,
        email,
        defaultProfilePictureURL,
      );

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
        "auth/email-already-in-use": `The email address: ${email} is already in use, either try signing in with ${email} or use a different email.`,
        "auth/invalid-email": `Email address ${email} is invalid.`,
        "auth/operation-not-allowed": `Error during sign up.`,
        "auth/weak-password":
          "Password is not strong enough. Add additional characters including special characters and numbers.",
      };
      setErrorMessage(
        errorMap[error.code] ||
          "Error signing up, please reload the page and try again.",
      );
    }
  };

  const handleValidation = () => {
    const { username, email, password } = formData;
    const errors = validateSignup(username, email, password);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return errors;
    }
    return null;
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    const errors = handleValidation();
    if (!errors) return;
    e.preventDefault();
    if (errors.username) {
      usernameRef.current.focus();
    } else if (errors.email) {
      emailRef.current.focus();
    } else if (errors.password) {
      passwordRef.current.focus();
    }
  };

  const handleChange = (e) => {
    setErrorMessage("");
    setFormErrors({});
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form noValidate onSubmit={onSignUserUp} className="flex flex-col">
      <label>Username</label>
      <input
        name="username"
        type="text"
        placeholder="Username"
        value={formData.username}
        ref={usernameRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <UsernameAvailability
        username={formData.username}
        setIsButtonDisabled={setIsButtonDisabled}
      />
      <label>Email</label>
      <input
        name="email"
        type="email"
        placeholder="Email"
        ref={emailRef}
        value={formData.email}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <label>Password</label>
      <input
        name="password"
        type="password"
        placeholder="******"
        value={formData.password}
        ref={passwordRef}
        onChange={handleChange}
      />
      <div className="italic text-sm">*Must be at least 6 characters</div>
      <button
        type="submit"
        disabled={isButtonDisabled}
        className="border rounded-md bg-zinc-500"
      >
        Next
      </button>

      <input type="checkbox" ref={checkboxRef} />
      <span>Don&apos;t Remember Login</span>

      {formErrors.username ||
        formErrors.email ||
        formErrors.password ||
        errorMessage}
    </form>
  );
};

export default SignupForm;
