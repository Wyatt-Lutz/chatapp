import { useEffect, useRef, useState } from "react";
import { fetchUsernameData } from "../services/globalDatService";
import { db } from "../../firebase";


const UsernameAvailability = ({newUsername, setIsButtonDisabled}) => {
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [usernames, setUsernames] = useState([]);

  useEffect(() => {
    const fetchUsernames = async() => {
      console.log('fetched usernames');
      const usernameData = await fetchUsernameData(db);
      setUsernames(usernameData);
    }
    fetchUsernames();
  }, []);


  useEffect(() => {
    if (!newUsername) {
      setIsUsernameAvailable(null);
      setIsButtonDisabled(true);
      return;
    }

    const checkUsernameAvailability = () => {
      const isUsernameTaken = usernames.includes(newUsername);
      setIsUsernameAvailable(!isUsernameTaken);
      setIsButtonDisabled(isUsernameTaken);
    };


    const timeout = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(timeout);

  }, [usernames, newUsername, setIsButtonDisabled]);


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