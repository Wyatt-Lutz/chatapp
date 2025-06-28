import { sendEmailVerification, updateEmail } from "firebase/auth";
import { changeEmail } from "../../../services/settingsDataService";
import { useAuth } from "../../../context/providers/AuthContext";
import { auth, db } from "../../../../firebase";
import { useState } from "react";

const ChangeEmail = ({
  displayPassModal,
  passwordModalHeader,
  passwordModalText,
}) => {
  const { currUser } = useAuth();
  const [email, setEmail] = useState(currUser.email);

  const handleSaveEmail = async () => {
    await displayPassModal(passwordModalHeader, passwordModalText);

    await updateEmail(currUser, email);
    await changeEmail(db, currUser, email);

    await sendEmailVerification(currUser);
    const verificationCookieId = `verification-${currUser.uid}`;
    localStorage.setItem(
      verificationCookieId,
      JSON.stringify({ timestamp: Date.now(), counter: 1 }),
    );

    await auth.currentUser.reload();
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
