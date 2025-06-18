import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebase";

export const fetchProfilePicture = async (userUid) => {
  const pictureRef = ref(storage, `users/${userUid}`);
  const pictureUrl = await getDownloadURL(pictureRef);
  return pictureUrl;
};

export const uploadFile = async (file, storageLocation) => {
  return new Promise((resolve) => {
    const metadata = {
      contentType: file.type,
      cacheControl: "public,max-age=31536000",
    };

    const fileRef = ref(storage, storageLocation);
    const uploadTask = uploadBytesResumable(fileRef, file, metadata);

    uploadTask.on(
      "state_changed",
      (snap) => {
        switch (snap.state) {
          case "paused":
            console.error("upload is paused");
            break;
          case "running":
            console.log("uploading");
            break;
        }
      },
      (error) => {
        switch (error.code) {
          case "storage/unauthorized":
            console.error("user doesn't have permission to upload");
            break;
          case "storage/canceled":
            console.error("upload is canceled");
            break;
          case "storage/unknown":
            console.error("unknown error");
            break;
        }
      },
      async () => {
        const fileURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(fileURL);
      },
    );
  });
};
