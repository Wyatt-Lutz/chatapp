import UsernameAvailability from "../../../components/UsernameAvailability";
import { changeUsername } from "../../../services/settingsDataService";
import { useState } from "react";
import { fetchLastUsernameChangeTime } from "../../../services/userDataService";
import { useAuth } from "../../../context/providers/AuthContext";
import { db } from "../../../../firebase";
import { useChatContexts } from "../../../hooks/useContexts";

const ChangeUsername = ({
  displayPassModal,
  passwordModalHeader,
  passwordModalText,
}) => {
  const { currUser } = useAuth();
  const { chatroomsDispatch } = useChatContexts();

  const [isEditUsernameDisabled, setIsEditUsernameDisabled] = useState(false);
  const [username, setUsername] = useState(currUser.displayName);
  const [isDisplayUsernameConfirmation, setIsDisplayUsernameConfirmation] =
    useState(false);

  const editUsername = async () => {
    if (isEditUsernameDisabled) return;
    const lastUsernameChange = await fetchLastUsernameChangeTime(
      db,
      currUser.uid,
    );
    if (Date.now() - lastUsernameChange < 864000000) {
      //10 days
      return;
    }

    await displayPassModal(passwordModalHeader, passwordModalText);

    setIsDisplayUsernameConfirmation(false);
    await changeUsername(db, username, currUser, chatroomsDispatch);
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
