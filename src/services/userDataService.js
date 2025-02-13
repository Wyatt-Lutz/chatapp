import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebase";
import { readAndCompressImage } from "browser-image-resizer";

export const fetchProfilePicture = async(userUid) => {
    const pictureRef = ref(storage, `users/${userUid}`);
    const pictureUrl = await getDownloadURL(pictureRef);
    return pictureUrl;
}


export const compressImage = async(originalImage) => {
    const imageCompressionConfig = {
        quality: 3.0,
        maxWidth: 512,
        maxHeight: 512,
    };
  
    const resizedImage = await readAndCompressImage(originalImage, imageCompressionConfig);
    return resizedImage;
}


export const uploadPicture = async(image, storageLocation) => {
    const metadata = {
        contentType: image.type,
    };

    const pictureRef = ref(storage, storageLocation);
    const uploadTask = uploadBytesResumable(pictureRef, image, metadata);
  
      uploadTask.on('state_changed', (snap) => {
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
        return imageURL;
      });
}