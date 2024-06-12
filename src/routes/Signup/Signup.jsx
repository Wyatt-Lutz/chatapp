import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { db, auth } from "../../../firebase";
import { createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import { ref, set, get, query, orderByChild, equalTo } from 'firebase/database'



const Signup = () => {
  const { register, formState: { errors }, handleSubmit, resetField } = useForm();

  const navigate = useNavigate();
  const onSubmit = async({email, password, username}) => {
    try {

      const usersQuery = query(ref(db, "users"), orderByChild('username'), equalTo(username));
      await get(usersQuery).then((snap) => {
        if (snap.exists()) {
          console.log('username already exists'); //toast
          resetField('username')
          return;
        }
      })


      await createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
        console.log(userCredential);
        const trimmedUsername = username.trim();
        await updateProfile(userCredential.user, {displayName: trimmedUsername});

        const uid = userCredential.user.uid;

        set(ref(db, "users/" + uid), {
          username: trimmedUsername,
          email: email,
          blocked: [],
          chatsIn: [],
        });

        console.info('registration successful');

        navigate("/");
      }).catch(error => {
        switch (error.code) {
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
      });


    } catch (error) {
      console.error(error);
    }
  }


  return(
    <section>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <input type="text" placeholder="Username" {...register('username', { required: {value: true, message: "Usernames are required."}, maxLength: {value: 15, message: "Usernames cannot be longer than 15 characters."}, pattern: {value: /^[A-Za-z0-9]+$/, message: "can only use lowercase and uppercase letters, and numbers."} })}></input>
        <input type="email" placeholder="Email" {...register('email', { required: {value: true, message: "Emails are required."}, maxLength: {value: 254, message: "Email adresses cannot exceed 254 characters."}, pattern: {value: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/, message: "Not valid email."} })}></input>
        <input type="password" placeholder="******" {...register('password', { required: {value: true, message: "Passwords are required."}, maxLength: {value: 128, message: "Passwords cannot exceed 128 characters."}, minLength: {value: 6, message: "Passwords must be at least 6 characters."}, pattern: {value: /^[A-Za-z0-9$!@#%^&*()-_+=\[\]{};:'",.<>/?`~\\|]+$/, message: "Invalid use of characters inside password."}})}></input>
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
