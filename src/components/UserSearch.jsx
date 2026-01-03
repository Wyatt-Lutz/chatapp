import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/providers/AuthContext";

import BlockedUserWarning from "./BlockedUserWarning";
import PopupError from "./PopupError";
import { fetchUserData, queryUsernames } from "../services/userDataService";

const UserSearch = ({ addedUsers, setAddedUsers, previousUsers = null }) => {
  const [usernameQueryData, setUsernameQueryData] = useState([]);
  const [searchedUsername, setSearchedUsername] = useState("");
  const [modal, setModal] = useState({ type: "", user: null });
  const { currUser } = useAuth();
  const [popup, setPopup] = useState("");

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

      const transformedData = Object.entries(usernameQueryData).map(
        ([uid, userData]) => ({ uid, ...userData }),
      );

      const combinedUsers = previousUsers
        ? [...addedUsers, ...previousUsers]
        : addedUsers;
      const cleanedData = transformedData.filter(
        (user) =>
          user.uid !== currUser.uid &&
          !combinedUsers.some((addedUser) => addedUser.uid === user.uid),
      );

      setUsernameQueryData(cleanedData);
    };

    const timeout = setTimeout(fetchUsernames, 300);
    return () => clearTimeout(timeout);
  }, [searchedUsername, previousUsers, currUser.uid]);

  const addUser = async (user) => {
    const [currUserBlockData, addedUserBlockData] = await Promise.all([
      fetchUserData(db, currUser.uid, "blockList"),
      fetchUserData(db, user.uid, "blockList"),
    ]);

    if (addedUserBlockData[currUser.uid]) {
      setPopup(
        "The user you are adding has blocked you. You cannot add them to a group chat.",
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

  return (
    <div className="w-full space-y-4">
      {modal.type === "blockedWarning" && (
        <BlockedUserWarning {...modal.props} />
      )}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Search Users
        </label>
        <input
          placeholder="Type a username..."
          type="text"
          value={searchedUsername}
          onChange={(e) => setSearchedUsername(e.target.value)}
          className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition"
        />
      </div>

      {usernameQueryData && usernameQueryData.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Available Users
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {usernameQueryData.map((user) => (
              <div
                className="flex items-center gap-3 p-3 bg-zinc-800/40 border border-zinc-700/50 rounded-lg hover:bg-zinc-800/70 hover:border-zinc-600/50 transition group"
                key={user.uid}
              >
                <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-zinc-700">
                  <img
                    className="h-full w-full object-cover"
                    src={user.profilePictureURL}
                    alt={user.username}
                  />
                </div>
                <div className="grow min-w-0">
                  <p className="font-medium text-zinc-100 truncate">
                    {user.username}
                  </p>
                </div>
                <button
                  onClick={() => addUser(user)}
                  className="px-3 py-1.5 text-sm bg-linear-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-lg transition font-semibold shrink-0"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : searchedUsername.trim() ? (
        <div className="text-center py-8 text-zinc-400 text-sm">
          <p>No users found matching "{searchedUsername}"</p>
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-500 text-sm">
          <p>Start typing a username to search</p>
        </div>
      )}
      {previousUsers && previousUsers.length > 0 && (
        <div className="space-y-2 border-t border-zinc-700/50 pt-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Current Members (
            {previousUsers.filter((user) => !user.isBanned).length})
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
            {previousUsers
              .filter((user) => !user.isBanned)
              .map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center gap-3 p-3 bg-zinc-800/30 border border-zinc-700/40 rounded-lg"
                >
                  <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 ring-2 ring-zinc-700">
                    <img
                      className="h-full w-full object-cover"
                      src={user.profilePictureURL}
                      alt={user.username}
                    />
                  </div>
                  <div className="grow min-w-0">
                    <p className="font-medium text-zinc-300 text-sm truncate">
                      {user.username}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {popup && <PopupError message={popup} type="error" />}
    </div>
  );
};

export default UserSearch;
