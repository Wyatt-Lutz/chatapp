import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useForm } from "react-hook-form";
import { storage } from "../../../firebase";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";


const ProfilePictureUpload = ({user}) => {
  console.log(user);
  console.log(user.userCredential.uid);

  const navigate = useNavigate();

  const {register, handleSubmit} = useForm();
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchDefaultImage = async() => {
      const defaultPictureRef = ref(storage, `users/kingmancho.jpg`);
      const defaultPictureURL = await getDownloadURL(defaultPictureRef);
      console.log(defaultPictureURL);
      setProfilePicture(defaultPictureURL);
    }

    fetchDefaultImage();

  }, []);


  const onSubmit = async({file}) => {

    const pictureRef = ref(storage, `users/${user.userCredential.uid}`);
    const uploadTask = uploadBytesResumable(pictureRef, file);

    uploadTask.on('state_changed', (snap) => {
      const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
      console.log(progress);
      switch (snap.state) {
        case 'paused':
          console.error("upload is paused");
          break;
        case 'running':
          console.log('uploading');
          break;
      }
    }, (error) => {
      switch (error.code) {
        case 'storage/unauthorized':
          console.error('user doesnt have permission to upload');
          break;
        case 'storage/canceled':
          console.error('upload is canceled');
          break;
        case 'storage/unknown':
          console.error('unknown error');
          break;
      }
    }, async() => {
      const imageURL = await getDownloadURL(uploadTask.snap.ref);
      setProfilePicture(imageURL);
    });
  }



  const onFinish = async() => {
    await updateProfile(user.userCredential, {displayName: user.displayName, photoURL: profilePicture});
    navigate("/")
  }


  return (
    <>
      <img src={profilePicture} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="file" {...register('image')}/>
        <button type="submit">Choose</button>
      </form>

      <button onClick={onFinish}>Complete</button>
    </>
  )
}

export default ProfilePictureUpload;