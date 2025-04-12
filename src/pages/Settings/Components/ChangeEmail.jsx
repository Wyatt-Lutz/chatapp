import { sendEmailVerification, updateEmail } from "firebase/auth";
import { useForm, useWatch } from "react-hook-form";
import { changeEmail } from "../../../services/settingsDataService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/providers/AuthContext";
import { db } from "../../../../firebase";


const ChangeEmail = ({displayPassModal, passwordModalHeader, passwordModalText}) => {
    const { currUser } = useAuth();
    const {register, control} = useForm({
        defaultValues: {
            newEmail: currUser.email,
        }
    });

    const navigate = useNavigate();
    const newEmail = useWatch({ name: 'newEmail', control });
    const editEmail = async() => {
        await displayPassModal(passwordModalHeader, passwordModalText);

        await updateEmail(currUser, newEmail);
        await sendEmailVerification(currUser);
        const verificationCookieId = `verification-${currUser.uid}`
        localStorage.setItem(verificationCookieId, true);

        await changeEmail(db, currUser, newEmail);

        navigate("/");


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
