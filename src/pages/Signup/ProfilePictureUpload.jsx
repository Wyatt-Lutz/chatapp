import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changeProfilePicture } from "../../services/storageDataService";
import { compressImage } from "../../utils/mediaUtils";

import Camera from "../../components/ui/Camera";
import { showToast } from "../../services/toastService";

const ProfilePictureUpload = ({ userData }) => {
  const navigate = useNavigate();
  const { photoURL } = userData.userCredential.user;
  const [profilePicture, setProfilePicture] = useState(photoURL);
  const [isChangingPicture, setIsChangingPicture] = useState(false);

  const onFinish = async () => {
    if (!isChangingPicture) {
      navigate("/");
      return;
    }

    try {
      await changeProfilePicture(
        userData.userCredential.user,
        profilePicture,
        null,
      );
      navigate("/");
    } catch (error) {
      showToast(
        "Something went wrong. Please reload the page and try to signup again.",
      );
      console.error(error);
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
    setProfilePicture(photoURL);
    setIsChangingPicture(false);
    URL.revokeObjectURL(profilePicture);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-800/60 backdrop-blur rounded-xl shadow-lg border border-zinc-700 p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Set your profile picture
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              You can skip this for now and change it later in settings.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 group">
              <img
                src={
                  profilePicture instanceof Blob
                    ? URL.createObjectURL(profilePicture)
                    : profilePicture
                }
                alt="Profile preview"
                className="w-full h-full rounded-full object-cover border border-zinc-700 shadow-md"
              />
              <label
                htmlFor="filePicker"
                className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer bg-black/0 group-hover:bg-black/50 transition"
              >
                <span className="opacity-0 group-hover:opacity-100 transition flex flex-col items-center gap-1 text-xs text-zinc-100">
                  <Camera />
                  <span>Change</span>
                </span>
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
              <button
                type="button"
                onClick={onCancel}
                className="mt-2 inline-flex items-center justify-center rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition"
              >
                Cancel changes
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onFinish}
            className="mt-8 w-full inline-flex items-center justify-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
