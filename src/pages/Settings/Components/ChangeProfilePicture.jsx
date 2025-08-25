import { useState } from "react";
import { compressImage } from "../../../utils/mediaUtils";
import { useAuth } from "../../../context/providers/AuthContext";
import Camera from "../../../components/ui/Camera";
import { useToast } from "../../../context/ToastContext";
import PopupError from "../../../components/PopupError";
import { changeProfilePicture } from "../../../services/storageDataService";
import { useChatContexts } from "../../../hooks/useContexts";

const ChangeProfilePicture = () => {
  const { currUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState(currUser.photoURL);
  const [isChangingPicture, setIsChangingPicture] = useState(false);
  const { chatroomsState } = useChatContexts();
  const { showToast } = useToast();
  const [popup, setPopup] = useState("");
  const onFinish = async () => {
    try {
      await changeProfilePicture(
        currUser,
        profilePicture,
        chatroomsState.chatrooms,
      );
      showToast("Successfully changed profile picture!", "success");
    } catch (error) {
      showToast(
        "Something went wrong, please reload the page and upload the image again.",
      );
      console.error(error);
    } finally {
      setIsChangingPicture(false);
    }
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

  const handleClick = (e) => {
    if (!currUser.emailVerified) {
      e.preventDefault();
      setPopup("To change your profile picture, please verify your email.");
    }
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
          onClick={handleClick}
          accept="image/*"
          onChange={handlePickImage}
        />
      </div>
      {popup && <PopupError message={popup} type="error" />}
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
