import UsernameAvailability from "../../../components/UsernameAvailability";
import { changeUsername } from "../../../services/settingsDataService";
import { useState } from "react";
import { useAuth } from "../../../context/providers/AuthContext";
import { db } from "../../../../firebase";
import { useChatContexts } from "../../../hooks/useContexts";
import PopupError from "../../../components/PopupError";
import { fetchUserData } from "../../../services/userDataService";

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
    <>
      <div className="flex">
        <label>Username</label>
        <input
          onChange={(e) => {
            setUsername(e.target.value);
            setIsDisplayUsernameConfirmation(true);
          }}
          value={username}
          type="text"
        />

        {isDisplayUsernameConfirmation && (
          <div>
            <UsernameAvailability
              username={username}
              setIsButtonDisabled={setIsEditUsernameDisabled}
            />
            {popup && <PopupError message={popup} type="error" />}
            <button disabled={isEditUsernameDisabled} onClick={editUsername}>
              Save Username
            </button>
          </div>
        )}
      </div>
    </>
  );
};
export default ChangeUsername;
