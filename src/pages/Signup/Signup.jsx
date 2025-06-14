import SignupForm from "./SignupForm";
import { lazy, useState } from "react";

const ProfilePictureUpload = lazy(() => import("./ProfilePictureUpload"));

const Signup = () => {
  const [userData, setUserdata] = useState(null);

  const handleSignupSubmit = (user) => {
    setUserdata(user);
  };

  return (
    <section>
      {!userData ? (
        <SignupForm onSubmitForm={handleSignupSubmit} />
      ) : (
        <ProfilePictureUpload user={userData} />
      )}
    </section>
  );
};
export default Signup;
