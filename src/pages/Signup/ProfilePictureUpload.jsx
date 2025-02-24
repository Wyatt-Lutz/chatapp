import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { compressImage, fetchProfilePicture, uploadPicture } from "../../services/userDataService";


const ProfilePictureUpload = ({user}) => {

  const navigate = useNavigate();

  const {register, handleSubmit} = useForm();
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchDefaultProfilePicture = async() => {
      const defaultPictureUrl = await fetchProfilePicture('default.jpg');
      setProfilePicture(defaultPictureUrl);
    }
    fetchDefaultProfilePicture();
  }, []);



  const onSubmitImage = async({image}) => {
    console.log(image);
    const tempCompressedImage = await compressImage(image[0]);
    console.log(tempCompressedImage);
    setProfilePicture(tempCompressedImage);
  }

  const onFinish = async() => {
    const photoStorageLocation = `users/${user.userCredential.user.uid}`;
    try {
      const photoUrl = await uploadPicture(profilePicture, photoStorageLocation);
      console.log('photo url: ' + photoUrl);
      await updateProfile(user.userCredential.user, {
        displayName: user.displayName,
        photoURL: photoUrl
      });

    } catch (err) {
      console.error(err);
    }

    navigate("/");
  }


  return (
    <>
      {profilePicture ? <img src={profilePicture instanceof Blob ? URL.createObjectURL(profilePicture) : profilePicture} /> : <p>Loading...</p>}

      <form onSubmit={handleSubmit(onSubmitImage)}>
        <input type="file" {...register('image')}/>
        <button type="submit">Choose</button>
      </form>

      <button onClick={onFinish}>Complete</button>
    </>
  )
}

export default ProfilePictureUpload;