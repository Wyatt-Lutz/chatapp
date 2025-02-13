import { useForm, useWatch } from "react-hook-form";
import UsernameAvailability from "../../../components/UsernameAvailability";
import { changeUsername } from "../../../services/settingsDataService";
import { useState } from "react";

const ChangeUsername = ({db, currUser, displayPassModal, passwordModalHeader, passwordModalText}) => {
    const {register, control} = useForm({
        defaultValues: {
            newUsername: currUser.displayName,
        }
    })
    const [isEditUsernameDisabled, setIsEditUsernameDisabled] = useState(false);
    const newUsername = useWatch({ name: 'newUsername', control });

    const editUsername = async() => {
        await displayPassModal(passwordModalHeader, passwordModalText);
    
        const isChanged = await changeUsername(db, newUsername, currUser);
        if (isChanged) {
          console.log("username changed");
        }
    
      }
    return (
        <>
            <div className="flex">
                <label>Username</label>
                <input type="text" {...register('newUsername')} />

                {newUsername !== currUser.displayName && (
                    <div>
                        <UsernameAvailability newUsername={newUsername} setIsButtonDisabled={setIsEditUsernameDisabled} />
                        <button disabled={isEditUsernameDisabled} onClick={editUsername}>Save Username</button>
                    </div>
                )}
            </div>
        </>
    )
}
export default ChangeUsername;