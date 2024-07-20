import { useEffect, useRef, useState } from "react";
import { fetchUsernameData } from "../services/globalDatService";
import { db } from "../../firebase";


const UsernameAvaliability = ({newUsername, setIsButtonDisabled}) => {

  console.log('usernameAvaliability run');
  const hasMounted = useRef(false);
  const [isUsernameAvaliable, setIsUsernameAvaliable] = useState(null);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    let timeout;
    let usernames;

    const fetchUsernames = async() => {
      const usernameData = await fetchUsernameData(db);

      usernames = Object.values(usernameData).map((user) => user.username)
    }
    fetchUsernames();


    const checkUsernameValidity = async(username) => {
      const isUsernameTaken = usernames.includes(username);
      setIsUsernameAvaliable(!isUsernameTaken);
      setIsButtonDisabled(isUsernameTaken);
    }

    if (newUsername) {
      timeout = setTimeout(() => {
        checkUsernameValidity(newUsername);
      }, 500);
    } else {
      setIsUsernameAvaliable(null);
      setIsButtonDisabled(true);
    }

    return () => clearTimeout(timeout);
  }, [newUsername]);

  return (
    <>
      {isUsernameAvaliable === true && (
        <div className="text-green-500">Username is Avaliable</div>
      )}
      {isUsernameAvaliable === false && (
        <div className="text-red-400">Username is not avaliable. Consider adding numbers and special characters.</div>
      )}
    </>
  )
}
export default UsernameAvaliability;