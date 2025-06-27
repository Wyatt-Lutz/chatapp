import { useEffect, useState } from "react";
import { queryUsernames } from "../services/globalDataService";
import { db } from "../../firebase";

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

      const usernameData = await queryUsernames(db, username);

      if (!usernameData) {
        setIsUsernameAvailable(true);
        setIsButtonDisabled(false);
        return;
      }
      const topUsername = Object.values(usernameData)[0]?.username;
      const isAvailable = topUsername !== username;

      setIsUsernameAvailable(isAvailable);
      setIsButtonDisabled(!isAvailable);
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
