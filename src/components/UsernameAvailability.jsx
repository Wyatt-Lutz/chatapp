import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { checkIfUsernameExists } from "../services/userDataService";

const UsernameAvailability = ({ username, setIsButtonDisabled }) => {
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  useEffect(() => {
    if (!username) {
      setIsUsernameAvailable(null);
      setIsButtonDisabled(true);
      return;
    }
    const fetchUsernames = async () => {
      if (!username.trim()) {
        setIsUsernameAvailable(null);
        setIsButtonDisabled(true);
        return;
      }

      const usernameExists = await checkIfUsernameExists(db, username);
      setIsUsernameAvailable(!usernameExists);
      setIsButtonDisabled(usernameExists);
    };
    const timeout = setTimeout(fetchUsernames, 500);
    return () => clearTimeout(timeout);
  }, [username]);

  return (
    <>
      {isUsernameAvailable === true && (
        <div className="text-green-500">Username is Available</div>
      )}
      {isUsernameAvailable === false && (
        <div className="text-red-400">
          Username is not available. Consider adding numbers and special
          characters.
        </div>
      )}
    </>
  );
};
export default UsernameAvailability;
