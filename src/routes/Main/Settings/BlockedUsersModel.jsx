import { memo, useContext, useEffect, useState } from "react"
import Close from "../../../styling-components/Close";
import { getBlockData, getUsernameFromUid, updateBlockedStatus } from "../../../services/memberDataService";
import { db } from "../../../../firebase";
import { AuthContext } from "../../../providers/AuthProvider";
import Minus from "../../../styling-components/Minus";

const BlockedUsersModel = ({changeDisplayment}) => {
  const { currUser } = useContext(AuthContext);
  const [blockedUsers, setBlockedUsers] = useState({});
  const [usernames, setUsernames] = useState({});
  useEffect(() => {
    const fetchBlockedUsers = async() => {
      const blockedUsers = await getBlockData(db, currUser.uid);
      setBlockedUsers(blockedUsers);

      const usernameData = {};
      for (const uid of Object.keys(blockedUsers)) {
        if (blockedUsers[uid]) {
          const username = await fetchUsername(uid);
          usernameData[uid] = username;
        }
      }
      setUsernames(usernameData);
    }
    fetchBlockedUsers();
  }, []);

  const fetchUsername = async(uid) => {
    const username = await getUsernameFromUid(db, uid);
    return username;
  }

  const unBlockUser = async(uid) => {
    await updateBlockedStatus(db, currUser.uid, uid, false);
  }






  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button onClick={() => changeDisplayment(null)} className="absolute top-4 right-4"><Close /></button>
        <h2 className="mb-4 text-lg font-semibold">Blocked Users</h2>

        {Object.keys(blockedUsers).map((uid) => (
          blockedUsers[uid] && (
            <div key={uid} className="flex">
              <div>{usernames[uid] || "Loading..."}</div>
              <button onClick={() => unBlockUser(uid)}><Minus /></button>
            </div>

          )
        ))}


      </div>
    </div>
  )




}

export default memo(BlockedUsersModel);