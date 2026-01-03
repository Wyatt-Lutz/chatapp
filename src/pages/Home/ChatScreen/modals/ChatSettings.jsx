import { useState } from "react";
import { db } from "../../../../firebase";
import CloseModal from "../../../../components/ui/CloseModal";
import Dropdown from "../../../../components/ui/Dropdown";
import { useChatContexts } from "../../../../hooks/useContexts";
import {
  fetchBannedUsers,
  unBanUser,
} from "../../../../services/memberDataService";
import UpwardArrow from "../../../../components/ui/UpwardArrow";
import { useAuth } from "../../../../context/providers/AuthContext";

const ChatSettings = ({ setIsSettingsOpen }) => {
  const { chatState, memberState } = useChatContexts();
  const [bannedUsers, setBannedUsers] = useState(null);
  const { currUser } = useAuth();
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
      memberState.members,
    );
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-700/70 bg-zinc-900/95 backdrop-blur shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700/70">
          <h2 className="text-xl font-semibold text-zinc-100">
            Chatroom Settings
          </h2>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-lg text-violet-400 hover:bg-zinc-800 transition"
            aria-label="Close"
          >
            <CloseModal />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <button
              onClick={() => {
                if (!isBannedUsersDropdown) {
                  handleLoadBannedUsers();
                } else {
                  setIsBannedUsersDropdown(false);
                }
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800/70 transition"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-rose-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                <span className="font-medium text-zinc-100">Banned Users</span>
              </div>
              <div className="text-violet-400">
                {!isBannedUsersDropdown ? <Dropdown /> : <UpwardArrow />}
              </div>
            </button>

            {isBannedUsersDropdown && (
              <div className="space-y-2 pl-4">
                {bannedUsers?.length > 0 ? (
                  bannedUsers.map((user) => (
                    <div
                      key={user.uid}
                      className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/40"
                    >
                      <div className="h-10 w-10 rounded-full overflow-hidden shrink-0">
                        <img
                          className="h-full w-full object-cover"
                          src={user.profilePictureURL}
                          alt={user.username}
                        />
                      </div>
                      <span className="flex-1 font-medium text-zinc-200 truncate">
                        {user.username}
                      </span>
                      {chatState.owner === currUser.uid && (
                        <button
                          onClick={() => handleUnbanUser(user)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-600/30 hover:bg-rose-600/30 transition text-sm font-medium"
                        >
                          Unban
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-400 text-sm">
                    No banned users
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-700/70">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatSettings;
