import { lazy, useState } from "react";
import { useForm } from "react-hook-form";
import { db } from "../../../../../firebase";
import { useAuth } from "../../../../context/providers/AuthContext";
import { editTitle } from "../../../../services/messageDataService";
import { useChatContexts } from "../../../../hooks/useContexts";

const Search = lazy(() => import("./Search"));
const AddUserModal = lazy(() => import("../modals/AddUserModal"));
const SearchSVG = lazy(() => import("../../../../components/ui/SearchSVG"));

const TopBar = () => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { register, handleSubmit, resetField } = useForm();
  const { chatState, chatDispatch, memberState } = useChatContexts();
  const chatID = chatState.chatID;
  const title = chatState.title;
  const tempTitle = chatState.tempTitle;
  const { currUser } = useAuth();
  const [isDisplayAddUser, setIsDisplayAddUser] = useState(false);
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);

  const onFinishEditTitle = async ({ title }) => {
    resetField("title");
    setIsEditingTitle(false);
    if (title === "") {
      return;
    }
    await editTitle(title, chatID, db, currUser.displayName, chatDispatch);
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
          <form onSubmit={handleSubmit(onFinishEditTitle)}>
            <input
              {...register("title", { required: false })}
              placeholder={title || tempTitle}
              onBlur={handleSubmit(onFinishEditTitle)}
            ></input>
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
