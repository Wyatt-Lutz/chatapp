import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { useForm } from "react-hook-form";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../../../../firebase";
import { uploadPicture } from "../../../services/storageDataService";
import { compressImage } from "../../../utils/mediaUtils";

const ChangeProfilePicture = ({currUser}) => {
    const {register, handleSubmit} = useForm();
    const [profilePicture, setProfilePicture] = useState(currUser.photoURL);


    const onSubmitImage = async({image}) => {
        const tempProfilePicture = await compressImage(image[0]);
        setProfilePicture(tempProfilePicture);
    }

    const onFinish = async() => {
        const photoStorageLocation = `users/${currUser.uid}` ;
        try {
            await deleteObject(ref(storage, photoStorageLocation));
            await uploadPicture(profilePicture, photoStorageLocation);
            await updateProfile(currUser, {photoURL: profilePicture});
        } catch (err) {
            console.error(err);
        }

    }


    return (
        <div>
           <img src={profilePicture} />
           <form onSubmit={handleSubmit(onSubmitImage)}>
                <input type="file" {...register('image')}/>
                <button type="submit">Choose</button>
            </form>

            <button onClick={onFinish}>Complete</button>
        </div>
    )
}
export default ChangeProfilePicture;