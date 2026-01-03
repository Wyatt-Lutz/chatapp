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
    <div className="bg-zinc-800/40 border-b border-zinc-700 px-2 md:px-4 py-3 items-center gap-2 md:gap-3 flex justify-between">
      {isDisplayAddUser && (
        <AddUserModal setIsDisplayAddUser={setIsDisplayAddUser} />
      )}
      {isSettingsOpen && <ChatSettings setIsSettingsOpen={setIsSettingsOpen} />}

      <div className="flex items-center gap-2 md:gap-3 min-w-0 w-13">
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className={`p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition shrink-0 ${
            isSidebarCollapsed ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          aria-label="Show sidebar"
          disabled={!isSidebarCollapsed}
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
      </div>

      <div
        className="flex justify-center min-w-0"
        onMouseOver={() => setIsEditingTitle(true)}
        onMouseLeave={() => setIsEditingTitle(false)}
      >
        <div className="w-full max-w-xl px-2 md:px-4 min-w-0">
          {memberState.members.size > 2 && isEditingTitle ? (
            <form onSubmit={onFinishEditTitle} className="w-full">
              <input
                value={topBarTitle}
                onChange={(e) => setTopBarTitle(e.target.value)}
                placeholder={title || membersTitle}
                onBlur={onFinishEditTitle}
                className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-2 md:px-3 py-1 md:py-2 text-sm md:text-base text-zinc-100 text-center"
              />
            </form>
          ) : (
            <div className="text-base md:text-lg font-semibold text-zinc-100 truncate text-center">
              {title || membersTitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3 justify-end">
        <button
          onClick={() => setIsDisplayAddUser(true)}
          className="px-3 md:px-3 py-2 rounded-md bg-zinc-700 hover:bg-zinc-700/80 text-white text-sm"
        >
          <span className="hidden sm:inline">Add Members</span>
          <span className="sm:hidden">+</span>
        </button>
        <button
          onClick={() => setIsSearchingMessages(true)}
          className="inline-flex items-center justify-center p-2 rounded-md bg-zinc-700 hover:bg-zinc-700/80 text-white"
          aria-label="Search messages"
        >
          <SearchSVG />
        </button>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="inline-flex items-center justify-center p-2 rounded-md bg-zinc-700 hover:bg-zinc-700/80 text-white"
          aria-label="Chat settings"
        >
          <SettingsSVG />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
