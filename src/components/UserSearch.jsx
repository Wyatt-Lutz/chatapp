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
        ([uid, userData]) => ({ uid, ...userData }),
      );
      console.log(previousUsers);
      const combinedUsers = previousUsers
        ? [...addedUsers, ...previousUsers]
        : addedUsers;
      const cleanedData = transformedData.filter(
        (user) =>
          user.uid !== currUser.uid &&
          !combinedUsers.some((addedUser) => addedUser.uid === user.uid),
      );

      console.log(cleanedData);
      setUsernameQueryData(cleanedData);
    };

    const timeout = setTimeout(fetchUsernames, 300);
    return () => clearTimeout(timeout);
  }, [searchedUsername, addedUsers, previousUsers, currUser.uid]);

  const addUser = async (user) => {
    console.log(user);
    const [currUserBlockData, addedUserBlockData] = await Promise.all([
      getBlockData(db, currUser.uid),
      getBlockData(db, user.uid),
    ]);

    if (addedUserBlockData[currUser.uid]) {
      console.log(
        "The user you are adding has blocked you. You cannot add them to a group chat",
      );
      return;
    }
    if (currUserBlockData[user.uid]) {
      const userConfirmation = await new Promise((resolve) => {
        setModal({
          type: "blockedWarning",
          props: {
            user: user,
            changeDisplayment: () => setModal({ type: null, props: {} }),
            changeConfirmation: (confirmed) => resolve(confirmed),
          },
        });
      });
      setModal({ type: null, props: {} });
      if (!userConfirmation) return;
    }

    setAddedUsers((prev) => [...prev, user]);
    setUsernameQueryData((prev) =>
      prev.filter((queryUser) => queryUser.uid !== user.uid),
    );
  };

  const removeFromAddedUsers = (user) => {
    setAddedUsers((prev) =>
      prev.filter((addedUser) => addedUser.uid !== user.uid),
    );
    setUsernameQueryData((prev) => [...prev, user]);
  };

  return (
    <div className="p-4 w-full max-w-lg mx-auto">
      {modal.type === "blockedWarning" && (
        <BlockedUserWarning {...modal.props} />
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
                key={user.uid}
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
                key={user.uid}
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
