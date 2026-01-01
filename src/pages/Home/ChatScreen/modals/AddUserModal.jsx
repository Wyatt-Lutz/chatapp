import { useState, useEffect } from "react";
import { useChatContexts } from "../../../../hooks/useContexts";
import { addUserToChat } from "../../../../services/memberDataService";
import { addMessage } from "../../../../services/messageDataService";

import UserSearch from "../../../../components/UserSearch";
import CloseModal from "../../../../components/ui/CloseModal";
import { useAuth } from "../../../../context/providers/AuthContext";
import { db } from "../../../../firebase";

const AddUserModal = ({ setIsDisplayAddUser }) => {
  const { chatState, memberState } = useChatContexts();
  const [addedUsers, setAddedUsers] = useState([]);
  const [previousUsers, setPreviousUsers] = useState([]);
  const { currUser } = useAuth();

  useEffect(() => {
    const currMemberData = [...memberState.members.entries()].reduce(
      (acc, [uid, data]) => {
        const shouldIncludeUser =
          (!data.isRemoved || (data.isRemoved && data.isBanned)) && // keep users who are not removed but not banned or banned (which means they have been removed)
          uid !== currUser.uid;

        if (shouldIncludeUser) {
          acc.push({ uid, ...data });
        }
        return acc;
      },
      [],
    );

    setPreviousUsers(currMemberData);
  }, [memberState.members, currUser.uid]);

  const onFinishAddingUsers = async () => {
    if (addedUsers.length === 0) {
      return;
    }
    setIsDisplayAddUser(null);
    addedUsers.forEach(async (user) => {
      await addUserToChat(db, user, chatState);
    });
    const userAddedServerMessage =
      addedUsers
        .map((user) => " " + user.username)
        .toString()
        .trim() + " has been added to the chat!";
    await addMessage(
      userAddedServerMessage,
      chatState.chatID,
      "server",
      db,
      true,
      memberState.members,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-700/70 bg-zinc-900/95 backdrop-blur shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700/70 bg-gradient-to-r from-zinc-800/50 to-transparent">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">Add Members</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Invite users to this chat
            </p>
          </div>
          <button
            onClick={() => setIsDisplayAddUser(false)}
            className="p-2 rounded-lg hover:bg-zinc-800 transition"
            aria-label="Close"
          >
            <CloseModal />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto no-scrollbar">
          <UserSearch
            addedUsers={addedUsers}
            setAddedUsers={setAddedUsers}
            previousUsers={previousUsers}
          />
        </div>

        {/* Selected Users Preview */}
        {addedUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-700/70 bg-zinc-800/30">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Selected ({addedUsers.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {addedUsers.map((user) => (
                <div
                  key={user.uid}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-violet-900/60 to-violet-900/40 border border-violet-700/50 text-zinc-100 text-sm font-medium hover:border-violet-600/70 transition"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={user.profilePictureURL}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{user.username}</span>
                  <button
                    onClick={() =>
                      setAddedUsers((prev) =>
                        prev.filter((u) => u.uid !== user.uid),
                      )
                    }
                    className="ml-1 hover:text-rose-400 transition"
                    aria-label={`Remove ${user.username}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-700/70 bg-zinc-900/50">
          <button
            onClick={() => setIsDisplayAddUser(false)}
            className="px-4 py-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 text-zinc-100 border border-zinc-600 transition font-medium text-sm"
          >
            Cancel
          </button>
          <button
            disabled={addedUsers.length === 0}
            onClick={onFinishAddingUsers}
            className="px-4 py-2 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Add Members {addedUsers.length > 0 && `(${addedUsers.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddUserModal;
