import { memo, useContext, useEffect, useState } from "react"
import Close from "../../../styling-components/Close";
import { getBlockData, getUsernameFromUid } from "../../../services/memberDataService";
import { db } from "../../../../firebase";
import { AuthContext } from "../../../AuthProvider";

const BlockedUsersModel = ({changeDisplayment}) => {
  const { currUser } = useContext(AuthContext);
  const [blockedUsers, setBlockedUsers] = useState({});
  useEffect(() => {
    const fetchBlockedUsers = async() => {
      const blockedUsers = await getBlockData(db, currUser.uid);
      console.log(Object.keys(blockedUsers));
      setBlockedUsers(blockedUsers);
    }
    fetchBlockedUsers();
  }, []);

  const fetchUsername = async(uid) => {
    const username = await getUsernameFromUid(db, uid);
    return username;
  }




  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button onClick={() => changeDisplayment(null)} className="absolute top-4 right-4"><Close /></button>
        <h2 className="mb-4 text-lg font-semibold">Blocked Users</h2>

        {Object.keys(blockedUsers).map((uid, index) => (
          blockedUsers[uid] ===false && (
            <div key={index}>{fetchUsername(uid)}</div>
          )
        ))}


      </div>
    </div>
  )




}

export default memo(BlockedUsersModel);