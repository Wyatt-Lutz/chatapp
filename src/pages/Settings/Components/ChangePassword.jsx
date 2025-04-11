import { updatePassword } from "firebase/auth";
import { useForm, useWatch } from "react-hook-form";
import { useAuth } from "../../../context/providers/AuthContext";

const ChangePassword = ({displayPassModal, passwordModalHeader, passwordModalText}) => {

    const {register, resetField, control} = useForm({
        defaultValues: {
            newPassword: "",
            confirmNewPassword: "",
        }
    });
    const { currUser } = useAuth();
    const newPassword = useWatch({ name: 'newPassword', control });
    const confirmNewPassword = useWatch({ name: 'confirmNewPassword', control });


    const editPassword = async() => {
        if (newPassword !== confirmNewPassword) return;

        await displayPassModal(passwordModalHeader, passwordModalText);

        await updatePassword(currUser, newPassword);
        resetField("newPassword");
        resetField("confirmNewPassword");
      }
    return (
        <>
            <div className="flex">
                <label>Change Password</label>
                <input type="password" placeholder="New password" {...register('newPassword')} />
                <input type="password" placeholder="Confirm new password "{...register('confirmNewPassword')}/>
                {(newPassword.length > 0 && confirmNewPassword.length > 0) && (
                <button disabled={(newPassword !== confirmNewPassword)} onClick={editPassword}>Save Password</button>
                )}
            </div>
        </>

    )
}
export default ChangePassword;
