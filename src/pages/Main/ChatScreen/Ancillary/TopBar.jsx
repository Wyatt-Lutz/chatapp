import { useState } from "react";
import { db } from "../../../../../firebase";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useChatContexts } from "../../../../hooks/useContexts";
import Search from "./Search";
import SearchSVG from "../../../../components/ui/SearchSVG";
import AddUserModal from "../modals/AddUserModal";
import SettingsSVG from "../../../../components/ui/SettingsSVG";
import ChatSettings from "../modals/ChatSettings";
import { editTitle } from "../../../../services/chatBarDataService";

const TopBar = () => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { chatState, memberState } = useChatContexts();
  const { chatID, title, tempTitle } = chatState;
  const { currUser } = useAuth();
  const [isDisplayAddUser, setIsDisplayAddUser] = useState(false);
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);
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
    <div>
      {isDisplayAddUser && (
        <AddUserModal setIsDisplayAddUser={setIsDisplayAddUser} />
      )}
      {isSettingsOpen && <ChatSettings setIsSettingsOpen={setIsSettingsOpen} />}
      <div
        className="ring"
        onMouseOver={() => setIsEditingTitle(true)}
        onMouseLeave={() => setIsEditingTitle(false)}
      >
        {memberState.members.size > 2 && isEditingTitle ? (
          <form onSubmit={onFinishEditTitle}>
            <input
              value={topBarTitle}
              onChange={(e) => setTopBarTitle(e.target.value)}
              placeholder={title || tempTitle}
              onBlur={onFinishEditTitle}
            />
          </form>
        ) : (
          <div>{title || tempTitle}</div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <button onClick={() => setIsDisplayAddUser(true)}>Add User</button>
        <button onClick={() => setIsSearchingMessages(true)}>
          <SearchSVG />
        </button>
        <button onClick={() => setIsSettingsOpen(true)}>
          <SettingsSVG />
        </button>
      </div>
      {isSearchingMessages && <Search />}
    </div>
  );
};

export default TopBar;
