import { sendEmailVerification, updateEmail } from "firebase/auth";
import { changeEmail } from "../../../services/settingsDataService";
import { useAuth } from "../../../context/providers/AuthContext";
import { useState } from "react";
import { db, auth } from "../../../firebase";

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
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (email !== currUser.email) handleSaveEmail();
      }}
    >
      <div>
        <label className="block text-sm font-medium text-zinc-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition"
        />
      </div>

      {email !== currUser.email && (
        <div>
          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition"
          >
            Save email
          </button>
        </div>
      )}
    </form>
  );
};
export default ChangeEmail;
