import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../../../../firebase";
import { uploadFile } from "../../../services/storageDataService";
import { compressImage } from "../../../utils/mediaUtils";
import { useAuth } from "../../../context/providers/AuthContext";
import Camera from "../../../components/ui/Camera";

const ChangeProfilePicture = () => {
  const { currUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState(currUser.photoURL);
  const [isChangingPicture, setIsChangingPicture] = useState(false);

  const onFinish = async () => {
    const photoStorageLocation = ref(storage, `users/${currUser.uid}`);

    await deleteObject(photoStorageLocation);
    const photoURL = await uploadFile(profilePicture, photoStorageLocation);
    await updateProfile(currUser, { photoURL: photoURL });
    setIsChangingPicture(false);
    // add successful toast
  };

  const handlePickImage = async (e) => {
    setIsChangingPicture(true);
    const file = e.target.files[0];
    e.target.value = null; //Allows the onChange to trigger again if the user tries to add the same picture to a different message
    if (!file) {
      setIsChangingPicture(false);
      return;
    }
    const compressedImage = await compressImage(file);
    setProfilePicture(compressedImage);
  };

  const onCancel = () => {
    setProfilePicture(currUser.photoURL);
    setIsChangingPicture(false);
    URL.revokeObjectURL(imageToUpload);
  };

  return (
    <div>
      <div className="relative w-32 h-32 group">
        <img
          src={
            profilePicture instanceof Blob
              ? URL.createObjectURL(profilePicture)
              : profilePicture
          }
          alt="hi"
          className="w-full h-full rounded-full overflow-hidden"
        />
        <label
          htmlFor="filePicker"
          className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer invisible group-hover:visible"
        >
          <div className="absolute inset-0 bg-black opacity-50 rounded-full"></div>
          <Camera />
        </label>
        <input
          type="file"
          id="filePicker"
          hidden
          accept="image/*"
          onChange={handlePickImage}
        />
      </div>
      {isChangingPicture && (
        <div>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onFinish}>Save</button>
        </div>
      )}
    </div>
  );
};
export default ChangeProfilePicture;
