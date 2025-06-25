import SignupForm from "./SignupForm";
import { lazy, useState } from "react";

const ProfilePictureUpload = lazy(() => import("./ProfilePictureUpload"));

const Signup = () => {
  const [userData, setUserData] = useState({});

  return (
    <section>
      {!userData ? (
        <SignupForm onSubmitForm={setUserData} />
      ) : (
        <ProfilePictureUpload user={userData} />
      )}
    </section>
  );
};
export default Signup;
