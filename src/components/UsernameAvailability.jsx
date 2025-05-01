import { useEffect, useState } from "react";
import { queryUsernames } from "../services/globalDataService";
import { db } from "../../firebase";


const UsernameAvailability = ({newUsername, setIsButtonDisabled}) => {
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);

  useEffect(() => {
    if (!newUsername) return;
    const fetchUsernames = async() => {

      if (!newUsername.trim()) {
        setIsUsernameAvailable(null);
        setIsButtonDisabled(true);
        return;
      }

      const usernameData = await queryUsernames(db, newUsername);

      if (!usernameData) {
        setIsUsernameAvailable(true);
        setIsButtonDisabled(false);
        return;
      }
      console.log(usernameData);
      const topUsername = Object.values(usernameData)[0]?.username;
      const isAvailable = topUsername !== newUsername

      setIsUsernameAvailable(isAvailable);
      setIsButtonDisabled(!isAvailable);
    }
    const timeout = setTimeout(fetchUsernames, 500);
    return () => clearTimeout(timeout);

  }, [newUsername]);




  return (
    <>
      {isUsernameAvailable === true && (
        <div className="text-green-500">Username is Available</div>
      )}
      {isUsernameAvailable === false && (
        <div className="text-red-400">Username is not available. Consider adding numbers and special characters.</div>
      )}
    </>
  )
}
export default UsernameAvailability;
