import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useForm } from "react-hook-form";
import { storage } from "../../../firebase";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { readAndCompressImage } from 'browser-image-resizer';


const ProfilePictureUpload = ({user}) => {

  const navigate = useNavigate();

  const {register, handleSubmit} = useForm();
  const [profilePicture, setProfilePicture] = useState(null);
  const [progress, setProgress] = useState(0);

  const imageCompressionConfig = {
    quality: 3.0,
    maxWidth: 512,
    maxHeight: 512,
  };

  useEffect(() => {
    const fetchDefaultImage = async() => {
      const defaultPictureRef = ref(storage, `users/kingmancho.jpg`);
      const defaultPictureURL = await getDownloadURL(defaultPictureRef);
      console.log(defaultPictureURL);
      setProfilePicture(defaultPictureURL);
    }

    fetchDefaultImage();

  }, []);


  const onSubmit = async({image}) => {
    console.log(image[0]);
    const metadata = {
      contentType: image[0].type,
    };

    const resizedImage = await readAndCompressImage(image[0], imageCompressionConfig);

    //const compressedImage = await imageCompression(image[0], imageCompressionConfig);
    const pictureRef = ref(storage, `users/${user.userCredential.user.uid}`);
    const uploadTask = uploadBytesResumable(pictureRef, resizedImage, metadata);

    uploadTask.on('state_changed', (snap) => {
      const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
      setProgress(progress);
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
      const imageURL = await getDownloadURL(uploadTask.snapshot.ref);
      setProfilePicture(imageURL);
    });
  }



  const onFinish = async() => {

    try {
      await updateProfile(user.userCredential.user, {displayName: user.displayName, photoURL: profilePicture});
    } catch (err) {
      console.error(err);
    }
    
    navigate("/")
  }


  return (
    <>
      <img src={profilePicture} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="file" {...register('image')}/>
        <button type="submit">Choose</button>
      </form>
      <progress max={100} value={progress}></progress>

      <button onClick={onFinish}>Complete</button>
    </>
  )
}

export default ProfilePictureUpload;