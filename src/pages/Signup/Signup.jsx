import { useNavigate } from "react-router-dom";
import SignupForm from "./SignupForm";
import ProfilePictureUpload from "./ProfilePictureUpload";
import { useState } from "react";

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
