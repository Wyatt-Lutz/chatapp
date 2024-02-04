import { useForm } from "react-hook-form";
import { db, auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";


const Signup = () => {

  const { register, handleSubmit } = useForm();



  const onSubmit = async({email, password, username}) => {
    try {
      const u = await createUserWithEmailAndPassword(auth, email, password);
      const uid = u.user.uid;

      await setDoc(doc(db, "users", uid), {
        email: email,
        username: username,
        uid: uid,
      });
      console.info('registration successful');





    } catch (error) {
      console.error(error);
    }




  }


  return(
    <section>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <input type="text" placeholder="Username" {...register('username', { required: true })}></input>
        <input type="email" placeholder="Email" {...register('email', { required: true })}></input>
        <input type="password" placeholder="******" {...register('password', { required: true })}></input>
        <div className="italic text-sm">*Must be at least 6 characters</div>
        <button type="submit" className="border rounded-md bg-zinc-500">Signup</button>
      </form>
    </section>

  )
}
export default Signup;