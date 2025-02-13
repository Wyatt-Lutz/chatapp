import { sendEmailVerification, updateEmail } from "firebase/auth";
import { useForm, useWatch } from "react-hook-form";
import { changeEmail } from "../../../services/settingsDataService";

const ChangeEmail = ({db, currUser, displayPassModal, passwordModalHeader, passwordModalText}) => {
    const {register, control} = useForm({
            defaultValues: {
                newEmail: currUser.email,
            }
        })
    const newEmail = useWatch({ name: 'newEmail', control });
    const editEmail = async() => {
        await displayPassModal(passwordModalHeader, passwordModalText);
    
        await updateEmail(currUser, newEmail);
        await sendEmailVerification(currUser);
    
        setModal({
          type: "EmailNotVerified",
          props: {
            email: currUser.email,
          }
        });
    
        await changeEmail(db, currUser, newEmail);
      }
    return (
        <>
            <div className="flex">
                <label>Email</label>
                <input type="email" {...register('newEmail')} />
                {newEmail !== currUser.email && (
                    <button onClick={editEmail}>Save Email</button>
                )}
            </div>
        </>
    )
}
export default ChangeEmail;