import { useForm, useWatch } from "react-hook-form";
import { db, auth } from "../../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import UsernameAvailability from "../../components/UsernameAvailability";
import { useState } from "react";
import { createUserData, fetchUsernameData } from "../../services/globalDataService";
import { fetchProfilePicture } from "../../services/storageDataService";
import { update, ref } from "firebase/database";


const SignupForm = ({ onSubmitForm }) => {
  const { register, formState: { errors }, handleSubmit, control } = useForm();
  const newUsername = useWatch({ name: 'username', control });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);



  const onSubmit = async({email, password, username}) => {
    if (isButtonDisabled) return;
    try {
      const usernames = await fetchUsernameData(db);
      if (usernames.includes(username)) {
        throw new Error('username-already-in-use');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log(userCredential);
      const trimmedUsername = username.trim();


      const uid = userCredential.user.uid;

      await createUserData(db, uid, trimmedUsername, email);

      const defaultPictureUrl = await fetchProfilePicture('HmKMbb9avVZYYt41TPCSuceWgqT2');
      console.log("defaultPicture: " + defaultPictureUrl);
      await updateProfile(userCredential.user, {
        displayName: trimmedUsername,
        photoURL: defaultPictureUrl,
      });

      const userRef = ref(db, `users/${uid}`);
      await update(userRef, {
        profilePictureURL: defaultPictureUrl,
      });

      console.info('registration successful');

      onSubmitForm({displayName: trimmedUsername, userCredential: userCredential});


    } catch(error) {
      switch (error.code) {
        case 'username-already-in-use':
          console.log('Username is already taken');
          break;
        case 'auth/email-already-in-use':
          console.log(`Email address ${email} already in use.`);
          break;
        case 'auth/invalid-email':
          console.log(`Email address ${email} is invalid.`);
          break;
        case 'auth/operation-not-allowed':
          console.log(`Error during sign up.`);
          break;
        case 'auth/weak-password':
          console.log('Password is not strong enough. Add additional characters including special characters and numbers.');
          break;
        default:
          console.log(error.message);
          break;
      }
    };
  }
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <label>Username</label>
      <input type="text" placeholder="Username" {...register('username', { required: {value: true, message: "Usernames are required."}, maxLength: {value: 15, message: "Usernames cannot be longer than 15 characters."}, pattern: {value: /^[A-Za-z0-9]+$/, message: "can only use lowercase and uppercase letters, and numbers."} })} />
      <UsernameAvailability newUsername={newUsername} setIsButtonDisabled={setIsButtonDisabled} />
      <label>Email</label>
      <input type="email" placeholder="Email" {...register('email', { required: {value: true, message: "Emails are required."}, maxLength: {value: 254, message: "Email addresses cannot exceed 254 characters."}, pattern: {value: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/, message: "Not valid email."} })} />
      <label>Password</label>
      <input type="password" placeholder="******" {...register('password', { required: {value: true, message: "Passwords are required."}, maxLength: {value: 128, message: "Passwords cannot exceed 128 characters."}, minLength: {value: 6, message: "Passwords must be at least 6 characters."}, pattern: {value: /^[A-Za-z0-9$!@#%^&*()_\-+=\[\]{};:'",.<>/?`~\\|]+$/, message: "Invalid use of characters inside password."}})} />
      <div className="italic text-sm">*Must be at least 6 characters</div>
      <button type="submit" disabled={isButtonDisabled} className="border rounded-md bg-zinc-500">Next</button>

      {errors.username?.message}
      {errors.email?.message}
      {errors.password?.message}
    </form>

  )
}

export default SignupForm;
