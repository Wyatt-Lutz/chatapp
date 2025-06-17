import { useState } from "react";
import { db } from "../../../../../firebase";
import { useAuth } from "../../../../context/providers/AuthContext";
import { editTitle } from "../../../../services/messageDataService";
import { useChatContexts } from "../../../../hooks/useContexts";
import Search from "./Search";
import SearchSVG from "../../../../components/ui/SearchSVG";
import AddUserModal from "../modals/AddUserModal";

const TopBar = () => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { chatState, chatDispatch, memberState } = useChatContexts();
  const { chatID, title, tempTitle } = chatState;
  const { currUser } = useAuth();
  const [isDisplayAddUser, setIsDisplayAddUser] = useState(false);
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);
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
      chatDispatch,
    );
  };

  return (
    <div>
      {isDisplayAddUser && (
        <AddUserModal setIsDisplayAddUser={setIsDisplayAddUser} />
      )}
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
      </div>
      {isSearchingMessages && <Search />}
    </div>
  );
};

export default TopBar;
