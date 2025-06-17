import { useForm, useWatch } from "react-hook-form";
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
import { update, ref } from "firebase/database";
import { useRef } from "react";

const SignupForm = ({ onSubmitForm }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    getValues,
    setFocus,
  } = useForm();
  const username = useWatch({ name: "username", control });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const checkboxRef = useRef(false);

  const onSubmit = async ({ email, password, username }) => {
    if (isButtonDisabled) return;
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
      console.log(userCredential);
      const trimmedUsername = username.trim();

      const uid = userCredential.user.uid;

      await createUserData(db, uid, trimmedUsername, email);

      await updateProfile(userCredential.user, {
        displayName: trimmedUsername,
        photoURL: "/default-profile.jpg",
      });

      const userRef = ref(db, `users/${uid}`);
      await update(userRef, {
        profilePictureURL: "/default-profile.jpg",
      });

      console.info("registration successful");

      onSubmitForm({
        displayName: trimmedUsername,
        userCredential: userCredential,
      });
    } catch (error) {
      const errorMap = {
        "username-already-in-use": "Username is already taken",
        "auth/email-already-in-use": `Email address ${email} already in use.`,
        "auth/invalid-email": `Email address ${email} is invalid.`,
        "auth/operation-not-allowed": `Error during sign up.`,
        "auth/weak-password":
          "Password is not strong enough. Add additional characters including special characters and numbers.",
      };
      console.error(errorMap[error.code] || error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key != "Enter") return;
    const { username, email, password } = getValues();
    if (!username || !email || !password) {
      e.preventDefault();
    }
    if (e.target.name === "username" && !email) {
      setFocus("email");
    } else if (e.target.name === "email" && !password) {
      setFocus("password");
    }
  };
  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col"
    >
      <label>Username</label>
      <input
        type="text"
        placeholder="Username"
        onKeyDown={handleKeyDown}
        {...register("username", {
          required: { value: true, message: "Usernames are required." },
          maxLength: {
            value: 15,
            message: "Usernames cannot be longer than 15 characters.",
          },
          pattern: {
            value: /^[A-Za-z0-9]+$/,
            message:
              "can only use lowercase and uppercase letters, and numbers.",
          },
        })}
      />
      <UsernameAvailability
        username={username}
        setIsButtonDisabled={setIsButtonDisabled}
      />
      <label>Email</label>
      <input
        type="email"
        placeholder="Email"
        onKeyDown={handleKeyDown}
        {...register("email", {
          required: { value: true, message: "Emails are required." },
          maxLength: {
            value: 254,
            message: "Email addresses cannot exceed 254 characters.",
          },
          pattern: {
            value: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/,
            message: "Not valid email.",
          },
        })}
      />
      <label>Password</label>
      <input
        type="password"
        placeholder="******"
        {...register("password", {
          required: { value: true, message: "Passwords are required." },
          maxLength: {
            value: 128,
            message: "Passwords cannot exceed 128 characters.",
          },
          minLength: {
            value: 6,
            message: "Passwords must be at least 6 characters.",
          },
          pattern: {
            value: /^[A-Za-z0-9$!@#%^&*()_\-+=\[\]{};:'",.<>/?`~\\|]+$/,
            message: "Invalid use of characters inside password.",
          },
        })}
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
      <span>Don't Remember Login</span>

      {errors.username?.message}
      {errors.email?.message}
      {errors.password?.message}
    </form>
  );
};

export default SignupForm;
