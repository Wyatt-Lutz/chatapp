import { useState } from "react";
import { db } from "../../../../../firebase";
import CloseModal from "../../../../components/ui/CloseModal";
import Dropdown from "../../../../components/ui/Dropdown";
import { useChatContexts } from "../../../../hooks/useContexts";
import {
  fetchBannedUsers,
  unBanUser,
} from "../../../../services/memberDataService";
import UpwardArrow from "../../../../components/ui/UpwardArrow";

const ChatSettings = ({ setIsSettingsOpen }) => {
  const { chatState, chatDispatch, memberState, messageDispatch } =
    useChatContexts();
  const [bannedUsers, setBannedUsers] = useState(null);
  const [isBannedUsersDropdown, setIsBannedUsersDropdown] = useState(false);

  const handleLoadBannedUsers = async () => {
    setIsBannedUsersDropdown(true);
    const bannedUsers = await fetchBannedUsers(db, chatState.chatID);
    setBannedUsers(bannedUsers);
  };

  const handleUnbanUser = async (user) => {
    setBannedUsers((prev) =>
      prev.filter((bannedUser) => bannedUser.uid !== user.uid),
    );
    await unBanUser(
      db,
      chatState.chatID,
      user.uid,
      user.username,
      chatDispatch,
      memberState.members,
      messageDispatch,
    );
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button
          onClick={() => setIsSettingsOpen(false)}
          className="absolute top-4 right-4"
        >
          <CloseModal />
        </button>
        <h2 className="mb-4 text-lg font-semibold">Chatroom Settings</h2>

        <div className="flex">
          <h3>Banned Users</h3>
          {!isBannedUsersDropdown ? (
            <button onClick={handleLoadBannedUsers}>
              <Dropdown />
            </button>
          ) : (
            <button onClick={() => setIsBannedUsersDropdown(false)}>
              <UpwardArrow />
            </button>
          )}
        </div>

        {isBannedUsersDropdown &&
          (bannedUsers?.length > 0 ? (
            bannedUsers.map((user) => (
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
                  onClick={() => handleUnbanUser(user)}
                  className="border text-red-600"
                >
                  Unban
                </button>
              </div>
            ))
          ) : (
            <div>No banned users!</div>
          ))}

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 text-white"
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatSettings;
