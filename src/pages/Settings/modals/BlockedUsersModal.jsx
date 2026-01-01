import { useEffect, useState } from "react";
import { updateBlockedStatus } from "../../../services/memberDataService";
import { useAuth } from "../../../context/providers/AuthContext";
import CloseModal from "../../../components/ui/CloseModal";
import { fetchUserData } from "../../../services/userDataService";
import { db } from "../../../firebase";

const BlockedUsersModal = ({ changeDisplayment }) => {
  const { currUser } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      const blockedUsers = await fetchUserData(db, currUser.uid, "blockList");

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
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/60 z-50">
      <div className="relative w-full max-w-xl p-6 bg-zinc-800/90 rounded-xl shadow-2xl border border-zinc-700">
        <button
          onClick={() => changeDisplayment(null)}
          className="absolute top-4 right-4"
          aria-label="Close blocked users modal"
        >
          <CloseModal />
        </button>

        <h2 className="mb-4 text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Blocked Users
        </h2>

        {users.length === 0 ? (
          <div className="py-6 text-center text-sm text-zinc-400">
            No blocked users.
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-auto pr-2">
            {users.map((user) => (
              <div
                className="flex items-center gap-4 p-3 bg-zinc-700/40 rounded-md hover:bg-zinc-700/30 transition"
                key={user.uid}
              >
                <div className="h-14 w-14 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    className="h-full w-full object-cover"
                    src={user.profilePictureURL}
                    alt={user.username}
                  />
                </div>
                <div className="flex-grow">
                  <div className="font-medium text-zinc-100">
                    {user.username}
                  </div>
                  <div className="text-xs text-zinc-400">{user.email}</div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => unBlockUser(user.uid)}
                    className="px-4 py-2 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-500 transition"
                  >
                    Unblock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedUsersModal;
