import { useState } from "react";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useChatContexts } from "../../../../hooks/useContexts";
import SearchSVG from "../../../../components/ui/SearchSVG";
import AddUserModal from "../modals/AddUserModal";
import SettingsSVG from "../../../../components/ui/SettingsSVG";
import ChatSettings from "../modals/ChatSettings";
import { editTitle } from "../../../../services/chatBarDataService";
import { db } from "../../../../firebase";

const TopBar = ({
  isSearchingMessages,
  setIsSearchingMessages,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { chatState, memberState } = useChatContexts();
  const { chatID, title, membersTitle } = chatState;
  const { currUser } = useAuth();
  const [isDisplayAddUser, setIsDisplayAddUser] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [topBarTitle, setTopBarTitle] = useState("");

  const onFinishEditTitle = async () => {
    setTopBarTitle("");
    setIsEditingTitle(false);
    if (topBarTitle === "") {
      return;
    }
    await editTitle(
      topBarTitle,
      chatID,
      db,
      currUser.displayName,
      memberState.members,
    );
  };

  return (
    <div className="bg-zinc-800/40 border-b border-zinc-700 px-4 py-3 flex items-center justify-between">
      {isDisplayAddUser && (
        <AddUserModal setIsDisplayAddUser={setIsDisplayAddUser} />
      )}
      {isSettingsOpen && <ChatSettings setIsSettingsOpen={setIsSettingsOpen} />}

      <div className="flex items-center gap-3 flex-1">
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
            aria-label="Show sidebar"
          >
            <svg
              className="w-5 h-5 text-zinc-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        <div
          className="flex-1"
          onMouseOver={() => setIsEditingTitle(true)}
          onMouseLeave={() => setIsEditingTitle(false)}
        >
          {memberState.members.size > 2 && isEditingTitle ? (
            <form onSubmit={onFinishEditTitle} className="w-full">
              <input
                value={topBarTitle}
                onChange={(e) => setTopBarTitle(e.target.value)}
                placeholder={title || membersTitle}
                onBlur={onFinishEditTitle}
                className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100"
              />
            </form>
          ) : (
            <div className="text-lg font-semibold text-zinc-100">
              {title || membersTitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={() => setIsDisplayAddUser(true)}
          className="px-3 py-2 rounded-md bg-zinc-700 hover:bg-zinc-700/80 text-white"
        >
          Add Members
        </button>
        <button
          onClick={() => setIsSearchingMessages(true)}
          className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-zinc-700 hover:bg-zinc-700/80 text-white"
        >
          <SearchSVG />
        </button>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-zinc-700 hover:bg-zinc-700/80 text-white"
        >
          <SettingsSVG />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
