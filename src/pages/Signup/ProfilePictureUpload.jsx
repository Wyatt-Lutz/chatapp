import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { uploadFile } from "../../services/storageDataService";
import { compressImage } from "../../utils/mediaUtils";
import { db } from "../../../firebase";

import Camera from "../../components/ui/Camera";
import { updateProfilePicture } from "../../services/userDataService";

const ProfilePictureUpload = ({ userData }) => {
  const navigate = useNavigate();
  const { uid, photoURL } = userData.userCredential.user;
  const [profilePicture, setProfilePicture] = useState(photoURL);
  const [isChangingPicture, setIsChangingPicture] = useState(false);

  const onFinish = async () => {
    if (!isChangingPicture) {
      navigate("/");
      return;
    }

    const photoStorageLocation = `users/${uid}`;
    const photoUrl = await uploadFile(profilePicture, photoStorageLocation);
    console.log("photo url: " + photoUrl);
    await updateProfile(userData.userCredential.user, {
      photoURL: photoUrl,
    });

    await updateProfilePicture(db, uid, photoUrl);

    navigate("/");
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
    setProfilePicture(photoURL);
    setIsChangingPicture(false);
    URL.revokeObjectURL(profilePicture);
  };

  return (
    <div>
      <div>Upload Custom Profile Picture</div>
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
        </div>
      )}
      <button onClick={onFinish}>Save</button>
    </div>
  );
};

export default ProfilePictureUpload;
