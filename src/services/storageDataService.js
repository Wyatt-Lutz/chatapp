import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { db, storage } from "../firebase";
import { updateProfile } from "firebase/auth";
import { update, ref as dbRef } from "firebase/database";

export const fetchProfilePicture = async (uid) => {
  const pictureRef = ref(storage, `users/${uid}`);
  const pictureUrl = await getDownloadURL(pictureRef);
  return pictureUrl;
};

export const changeProfilePicture = async (
  currUser,
  profilePicture,
  chatroomsData,
) => {
  const photoStorageLocation = ref(storage, `users/${currUser.uid}`);

  if (chatroomsData) {
    await deleteObject(photoStorageLocation);
  }
  const photoURL = await uploadFile(profilePicture, photoStorageLocation);

  const updates = {};
  updates[`users/${currUser.uid}/profilePictureURL`] = photoURL;
  if (chatroomsData) {
    const chatroomUids = [...chatroomsData.keys()];
    chatroomUids.forEach((uid) => {
      updates[`members/${uid}/${currUser.uid}/profilePictureURL`] = photoURL;
    });
  }

  await Promise.all([
    update(dbRef(db), updates),
    updateProfile(currUser, { photoURL: photoURL }),
  ]);
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
            "uploading";
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
