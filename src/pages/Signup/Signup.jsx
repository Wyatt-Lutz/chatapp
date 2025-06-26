import SignupForm from "./SignupForm";
import { lazy, useState } from "react";

const ProfilePictureUpload = lazy(() => import("./ProfilePictureUpload"));

const Signup = () => {
  const [userData, setUserData] = useState(null);

  return (
    <>
      {!userData ? (
        <SignupForm onSubmitForm={setUserData} />
      ) : (
        <ProfilePictureUpload userData={userData} />
      )}
    </>
  );
};
export default Signup;
