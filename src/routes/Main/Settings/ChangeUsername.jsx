import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../AuthProvider";
import { changeUsername } from "../../../services/settingsDataService";
import { db } from "../../../../firebase";
import { checkIfUserExists } from "../../../services/chatBarDataService";
import Close from "../../../styling-components/Close";

const ChangeUsername = ({changeUsernameDisplayment}) => {
  const { currUser } = useContext(AuthContext);

  const { register, handleSubmit,  formState: { errors }, watch } = useForm({
    defaultValues: {
      username: currUser.displayName,
    }
  });
  const [isUsernameAvaliable, setIsUsernameAvaliable] = useState(null);
  const newUsername = watch('username')
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    let timeout;
    const checkUsernameValidity = async(username) => {
      console.log('checked')
      const userData = await checkIfUserExists(db, username);
      setIsUsernameAvaliable(!userData);
    }

    if (newUsername) {
      timeout = setTimeout(() => {
        checkUsernameValidity(newUsername);
      }, 500);
    } else {
      setIsUsernameAvaliable(null);
    }

    return () => clearTimeout(timeout)
  }, [newUsername]);


  const onChangeUsernameSubmit = async() => {

    const isChanged = await changeUsername(db, newUsername, currUser);
    if (isChanged) {
      console.log("username changed successfully");
      setIsUsernameAvaliable(null);
      changeUsernameDisplayment(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button onClick={() => changeUsernameDisplayment(false)} className="absolute top-4 right-4"><Close /></button>
        <h2 className="mb-4 text-lg font-semibold">Edit your Username</h2>

        <p>Username</p>
        <input type="text" {...register('username')}  />

        {isUsernameAvaliable === true && (
          <div className="text-green-500">Username is Avaliable</div>
        )}
        {isUsernameAvaliable === false && (
          <div className="text-red-400">Username is not avaliable. Consider adding numbers and special characters.</div>
        )}



        <div className="flex justify-end space-x-2">
          <button onClick={() => changeUsernameDisplayment(false)} className="px-4 py-2 text-white">Cancel</button>
          <button disabled={!isUsernameAvaliable} onClick={onChangeUsernameSubmit} className="px-4 py-2 text-white bg-indigo-500 rounded">Done</button>
        </div>

      </div>

    </div>
  )
}
export default ChangeUsername;