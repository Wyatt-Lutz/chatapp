import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../../../context/providers/AuthContext";
import { db } from "../../../../firebase";
import {
  checkIfDuplicateChat,
  createChat,
} from "../../../../services/chatBarDataService";
import { useChatContexts } from "../../../../hooks/useContexts";
import { updateMembersTitle } from "../../../../utils/chatroomUtils";

import UserSearch from "../../../../components/UserSearch";
import CloseModal from "../../../../components/ui/CloseModal";
import PopupError from "../../../../components/PopupError";

const ChatCreationModal = ({
  changeChatRoomCreationState,
  setIsSidebarCollapsed,
}) => {
  const { currUser } = useAuth();
  const { chatroomsState, chatDispatch, resetAllChatContexts } =
    useChatContexts();
  const [addedUsers, setAddedUsers] = useState([]);
  const [chatTitleInputText, setChatTitleInputText] = useState("");
  const [popup, setPopup] = useState("");

  const handleCreateChat = async () => {
    if (addedUsers.length === 0) return;

    const { uid, displayName, photoURL } = currUser;

    const usersToAdd = [
      ...addedUsers,
      { uid, username: displayName, profilePictureURL: photoURL }, //This is the client users data
    ];

    const uids = usersToAdd.map((user) => user.uid);
    const memberUids = uids.sort().join("");

    //Check if there is an existing chatroom with duplicate members
    if (checkIfDuplicateChat(memberUids, chatroomsState.chatrooms)) {
      setPopup("A chatroom with those members already exists.");
      return;
    }

    const membersList = usersToAdd.reduce((acc, member) => {
      acc[member.uid] = {
        isOnline: false,
        username: member.username,
        isRemoved: false,
        isBanned: false,
        profilePictureURL: member.profilePictureURL,
      };
      return acc;
    }, {});

    const title = chatTitleInputText?.trim() || "";
    const membersTitle = Object.values(membersList)
      .map((member) => member.username)
      .join(", ");

    setChatTitleInputText("");

    const newChatID = await createChat(
      db,
      memberUids,
      title,
      membersTitle,
      membersList,
      uids,
      usersToAdd.length,
      uid,
    );
    changeChatRoomCreationState(false);
    const updatedMembersTitle = updateMembersTitle(membersTitle, displayName);

    resetAllChatContexts();
    chatDispatch({
      type: "CHANGE_CHAT",
      payload: {
        chatID: newChatID,
        title,
        owner: uid,
        membersTitle: updatedMembersTitle,
        numOfMembers: usersToAdd.length,
        firstMessageID: "",
        memberUids: memberUids,
      },
    });

    if (setIsSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-700/70 bg-zinc-900/95 backdrop-blur shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-zinc-700/70 bg-linear-to-r from-zinc-800/50 to-transparent">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-zinc-100">
              Create Group Chat
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add members and start a conversation
            </p>
          </div>
          <button
            onClick={() => changeChatRoomCreationState(false)}
            className="p-2 rounded-lg hover:bg-zinc-800 transition"
            aria-label="Close create chat modal"
          >
            <CloseModal />
          </button>
        </div>

        <div className="p-4 md:p-6 flex-1 overflow-y-auto no-scrollbar space-y-4">
          <UserSearch addedUsers={addedUsers} setAddedUsers={setAddedUsers} />

          {addedUsers.length > 2 && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Group Name (optional)
              </label>
              <input
                maxLength={25}
                onChange={(e) => setChatTitleInputText(e.target.value)}
                value={chatTitleInputText}
                className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition"
                placeholder="Enter group name"
              />
            </div>
          )}

          {popup && <PopupError message={popup} type="error" />}
        </div>

        {addedUsers.length > 0 && (
          <div className="px-4 md:px-6 py-3 md:py-4 border-t border-zinc-700/70 bg-zinc-800/30">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Selected ({addedUsers.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {addedUsers.map((user) => (
                <div
                  key={user.uid}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-linear-to-br from-violet-900/60 to-violet-900/40 border border-violet-700/50 text-zinc-100 text-sm font-medium hover:border-violet-600/70 transition"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
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

        <div className="flex justify-end gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-zinc-700/70 bg-zinc-900/50">
          <button
            onClick={() => changeChatRoomCreationState(false)}
            className="px-3 md:px-4 py-2 text-sm rounded-lg bg-zinc-700/50 hover:bg-zinc-700 text-zinc-100 border border-zinc-600 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChat}
            type="submit"
            disabled={addedUsers.length < 1}
            className="px-3 md:px-4 py-2 text-sm rounded-lg bg-linear-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Chat {addedUsers.length > 0 && `(${addedUsers.length})`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
export default ChatCreationModal;
