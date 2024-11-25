import { useEffect, useMemo, useRef, useState } from "react";
import { fetchUsernameData } from "../services/globalDatService";
import { db } from "../../firebase";


const UsernameAvaliability = ({newUsername, setIsButtonDisabled}) => {
  const [isUsernameAvaliable, setIsUsernameAvaliable] = useState(null);
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
      setIsUsernameAvaliable(null);
      setIsButtonDisabled(true);
      return;
    }

    const timeout = setTimeout(() => {
      console.log('recheck')
      const isUsernameTaken = usernames.current.includes(newUsername);
      setIsUsernameAvaliable(!isUsernameTaken);
      setIsButtonDisabled(isUsernameTaken);
    }, 500);


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