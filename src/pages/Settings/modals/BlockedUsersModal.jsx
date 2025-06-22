import { useEffect, useState } from "react";
import {
  getBlockData,
  updateBlockedStatus,
} from "../../../services/memberDataService";
import { db } from "../../../../firebase";
import { useAuth } from "../../../context/providers/AuthContext";

import Minus from "../../../components/ui/Minus";
import CloseModal from "../../../components/ui/CloseModal";
import { fetchUserData } from "../../../services/globalDataService";

const BlockedUsersModal = ({ changeDisplayment }) => {
  const { currUser } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      const blockedUsers = await getBlockData(db, currUser.uid);

      const blockedUids = Object.entries(blockedUsers).reduce(
        (uids, [uid, isBlocked]) => {
          if (isBlocked) uids.push(uid);
          return uids;
        },
        [],
      );

      const usersData = await Promise.all(
        blockedUids.map(async (uid) => {
          const userData = await fetchUserData(db, uid);
          return { ...userData, uid };
        }),
      );
      setUsers(usersData);
    };
    fetchBlockedUsers();
  }, [currUser.uid]);

  const unBlockUser = async (uid) => {
    setUsers((prev) => prev.filter((user) => user.uid !== uid));
    await updateBlockedStatus(db, currUser.uid, uid, false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button
          onClick={() => changeDisplayment(null)}
          className="absolute top-4 right-4"
        >
          <CloseModal />
        </button>
        <h2 className="mb-4 text-lg font-semibold">Blocked Users</h2>
        {users.length === 0 ? (
          <div>No blocked users.</div>
        ) : (
          <div>
            {users.map((user) => (
              <div
                className="flex items-center p-2 bg-gray-400 rounded-lg hover:bg-gray-200 transition"
                key={user.uid}
              >
                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                  <img
                    className="h-full w-full object-cover"
                    src={user.profilePictureURL}
                  />
                </div>
                <span className="flex-grow font-medium">{user.username}</span>
                <button
                  onClick={() => unBlockUser(user.uid)}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-blue-600 transition"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedUsersModal;
