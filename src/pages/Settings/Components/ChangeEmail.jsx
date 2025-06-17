import { sendEmailVerification, updateEmail } from "firebase/auth";
import { changeEmail } from "../../../services/settingsDataService";
import { useAuth } from "../../../context/providers/AuthContext";
import { db } from "../../../../firebase";
import { useState } from "react";

const ChangeEmail = ({
  displayPassModal,
  passwordModalHeader,
  passwordModalText,
}) => {
  const { currUser, refreshUser } = useAuth();
  const [email, setEmail] = useState(currUser.email);

  const handleSaveEmail = async () => {
    await displayPassModal(passwordModalHeader, passwordModalText);

    await updateEmail(currUser, email);
    await sendEmailVerification(currUser);
    const verificationCookieId = `verification-${currUser.uid}`;
    localStorage.setItem(verificationCookieId, true);

    await changeEmail(db, currUser, email);

    await refreshUser();
  };

  return (
    <div className="flex">
      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {email !== currUser.email && (
        <button onClick={handleSaveEmail}>Save Email</button>
      )}
    </div>
  );
};
export default ChangeEmail;
