import { useEffect, useRef, useState } from "react";
import { fetchUsernameData } from "../services/globalDatService";
import { db } from "../../firebase";


const UsernameAvailability = ({newUsername, setIsButtonDisabled}) => {
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const usernames = useRef([]);

  useEffect(() => {
    const fetchUsernames = async() => {
      const usernameData = await fetchUsernameData(db);
      usernames.current = Object.values(usernameData).map((user) => user.username);
    }
    fetchUsernames();
  }, []);

  useEffect(() => {
    if (!newUsername) {
      setIsUsernameAvailable(null);
      setIsButtonDisabled(true);
      return;
    }

    const timeout = setTimeout(() => {
      console.log('recheck')
      const isUsernameTaken = usernames.current.includes(newUsername);
      setIsUsernameAvailable(!isUsernameTaken);
      setIsButtonDisabled(isUsernameTaken);
    }, 500);


    return () => clearTimeout(timeout);
  }, [newUsername, setIsButtonDisabled]);


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