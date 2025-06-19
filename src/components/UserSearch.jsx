import { useEffect, useState } from "react";
import { queryUsernames } from "../services/globalDataService";
import { db } from "../../firebase";
import CloseModal from "./ui/CloseModal";
import { useAuth } from "../context/providers/AuthContext";
import { getBlockData } from "../services/memberDataService";

import BlockedUserWarning from "./BlockedUserWarning";

const UserSearch = ({ addedUsers, setAddedUsers, previousUsers = null }) => {
  const [usernameQueryData, setUsernameQueryData] = useState([]);
  const [searchedUsername, setSearchedUsername] = useState("");
  const [modal, setModal] = useState({ type: "", user: null });
  const { currUser } = useAuth();

  useEffect(() => {
    if (!searchedUsername.trim()) {
      setUsernameQueryData([]);
      return;
    }

    const fetchUsernames = async () => {
      const usernameQueryData = await queryUsernames(
        db,
        searchedUsername.trim(),
      );
      if (!usernameQueryData) {
        setUsernameQueryData([]);
        return;
      }
      console.log(usernameQueryData);

      const transformedData = Object.entries(usernameQueryData).map(
        ([userUid, userData]) => ({ userUid, ...userData }),
      );

      const combinedUsers = [...addedUsers, ...previousUsers];
      const cleanedData = transformedData.filter(
        (user) =>
          user.userUid !== currUser.uid &&
          !combinedUsers.some(
            (addedUser) => addedUser.userUid === user.userUid,
          ),
      );

      console.log(cleanedData);
      setUsernameQueryData(cleanedData);
    };

    const timeout = setTimeout(fetchUsernames, 300);
    return () => clearTimeout(timeout);
  }, [searchedUsername, addedUsers, previousUsers, currUser.uid]);

  const addUser = async (user) => {
    console.log(user);
    setAddedUsers((prev) => [...prev, user]);
    setUsernameQueryData((prev) =>
      prev.filter((queryUser) => queryUser.userUid !== user.userUid),
    );

    const [currUserBlockData, addedUserBlockData] = await Promise.all([
      getBlockData(db, currUser.uid),
      getBlockData(db, user.userUid),
    ]);

    if (addedUserBlockData[currUser.uid]) {
      console.log(
        "The user you are adding has blocked you. You cannot add them to a group chat",
      );
      return;
    }
    if (currUserBlockData[user.userUid]) {
      setModal({ type: "blockedWarning", user: user });
      return;
    }
  };

  const removeFromAddedUsers = (user) => {
    setAddedUsers((prev) =>
      prev.filter((addedUser) => addedUser.userUid !== user.userUid),
    );
    setUsernameQueryData((prev) => [...prev, user]);
  };

  return (
    <div className="p-4 w-full max-w-lg mx-auto">
      {modal.type === "blockedWarning" && (
        <BlockedUserWarning
          setModal={setModal}
          setAddedUsers={setAddedUsers}
          user={modal.user}
        />
      )}

      <input
        placeholder="Search Username..."
        type="text"
        value={searchedUsername}
        onChange={(e) => setSearchedUsername(e.target.value)}
        className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {usernameQueryData && usernameQueryData.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 mb-6">
          {usernameQueryData.map((user) => (
            <div
              className="flex items-center p-2 bg-gray-400 rounded-lg hover:bg-gray-200 transition"
              key={user.userUid}
            >
              <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                <img
                  className="h-full w-full object-cover"
                  src={user.profilePictureURL}
                />
              </div>
              <span className="flex-grow font-medium">{user.username}</span>
              <button
                onClick={() => addUser(user)}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-blue-600 transition"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 italic mb-6">No Matching usernames</div>
      )}

      {addedUsers && addedUsers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Added Users</h3>
          <div className="space-y-2">
            {addedUsers.map((user) => (
              <div
                key={user.userUid}
                className="flex items-center p-2 bg-gray-400 rounded-lg"
              >
                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                  <img
                    className="h-full w-full object-cover"
                    src={user.profilePictureURL}
                  />
                </div>
                <span className="flex-grow font-medium">{user.username}</span>
                <button
                  onClick={() => removeFromAddedUsers(user)}
                  className="p-1"
                >
                  <CloseModal />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {previousUsers && (
        <div>
          <div>Current Members</div>
          {previousUsers
            .filter((user) => !user.isBanned)
            .map((user) => (
              <div
                key={user.userUid}
                className="flex items-center p-2 bg-gray-400 rounded-lg"
              >
                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                  <img
                    className="h-full w-full object-cover"
                    src={user.profilePictureURL}
                  />
                </div>
                <span className="flex-grow font-medium">{user.username}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
