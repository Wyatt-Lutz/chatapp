import UsernameAvailability from "../../../components/UsernameAvailability";
import { changeUsername } from "../../../services/settingsDataService";
import { useState } from "react";
import { useAuth } from "../../../context/providers/AuthContext";
import { useChatContexts } from "../../../hooks/useContexts";
import PopupError from "../../../components/PopupError";
import { fetchUserData } from "../../../services/userDataService";
import { db } from "../../../firebase";

const ChangeUsername = ({
  displayPassModal,
  passwordModalHeader,
  passwordModalText,
  setCurrUsername,
}) => {
  const { currUser } = useAuth();
  const { chatroomsState, chatroomsDispatch } = useChatContexts();
  const [popup, setPopup] = useState("");
  const [isEditUsernameDisabled, setIsEditUsernameDisabled] = useState(false);
  const [username, setUsername] = useState(currUser.displayName);
  const [isDisplayUsernameConfirmation, setIsDisplayUsernameConfirmation] =
    useState(false);

  const editUsername = async () => {
    if (isEditUsernameDisabled) return;
    if (!currUser.emailVerified) {
      setPopup("To change your username, please verify your email.");
      return;
    }
    const lastUsernameChange = await fetchUserData(
      db,
      currUser.uid,
      "lastUsernameChange",
    );
    const tenDaysInMS = 10 * 24 * 60 * 60 * 1000;
    const timeElapsed = Date.now() - lastUsernameChange;
    const timeRemaining = tenDaysInMS - timeElapsed;

    if (timeRemaining > 0) {
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
      );

      setPopup(
        `You can only change your username every 10 days. Please wait ${days} day(s), ${hours} hour(s), and ${minutes} minute(s).`,
      );
      return;
    }

    await displayPassModal(passwordModalHeader, passwordModalText);

    setIsDisplayUsernameConfirmation(false);
    setCurrUsername(username);
    await changeUsername(
      db,
      username,
      currUser,
      chatroomsState.chatrooms,
      chatroomsDispatch,
    );
  };
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isEditUsernameDisabled) editUsername();
      }}
    >
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          Username
        </label>
        <input
          onChange={(e) => {
            setUsername(e.target.value);
            setIsDisplayUsernameConfirmation(true);
          }}
          value={username}
          type="text"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition"
        />
      </div>

      {isDisplayUsernameConfirmation && (
        <div className="space-y-2">
          <UsernameAvailability
            username={username}
            setIsButtonDisabled={setIsEditUsernameDisabled}
          />
          {popup && <PopupError message={popup} type="error" />}
          <div>
            <button
              type="submit"
              disabled={isEditUsernameDisabled}
              onClick={editUsername}
              className="inline-flex items-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              Save username
            </button>
          </div>
        </div>
      )}
    </form>
  );
};
export default ChangeUsername;
