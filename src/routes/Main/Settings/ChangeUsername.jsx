import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../AuthProvider";
import { changeUsername } from "../../../services/settingsDataService";
import { db } from "../../../../firebase";
import Close from "../../../styling-components/Close";
import UsernameAvaliability from "../../../utils/UsernameAvaliability";

const ChangeUsername = ({changeUsernameDisplayment}) => {
  const { currUser } = useContext(AuthContext);

  const { register, handleSubmit,  formState: { errors }, watch } = useForm({
    defaultValues: {
      username: currUser.displayName,
    }
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const newUsername = watch('username')

  const onChangeUsernameSubmit = async() => {

    const isChanged = await changeUsername(db, newUsername, currUser);
    if (isChanged) {
      console.log("username changed successfully");
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
        <UsernameAvaliability newUsername={newUsername} setIsButtonDisabled={setIsButtonDisabled} />

        <div className="flex justify-end space-x-2">
          <button onClick={() => changeUsernameDisplayment(false)} className="px-4 py-2 text-white">Cancel</button>
          <button disabled={isButtonDisabled} onClick={onChangeUsernameSubmit} className="px-4 py-2 text-white bg-indigo-500 rounded">Done</button>
        </div>

      </div>

    </div>
  )
}
export default ChangeUsername;