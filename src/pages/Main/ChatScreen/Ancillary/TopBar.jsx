import { useState } from "react"
import { useForm } from "react-hook-form";
import { db } from "../../../../../firebase";
import { useAuth } from "../../../../context/providers/AuthContext";
import { editTitle } from "../../../../services/messageDataService";
import { addUserToChat } from "../../../../services/memberDataService";
import { useChatContexts } from "../../../../hooks/useContexts";
import AddUserModal from "../modals/AddUserModal";
const TopBar = () => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { register, handleSubmit, resetField } = useForm();
  const { chatState, chatDispatch, memberState } = useChatContexts();
  const chatID = chatState.chatID;
  const title = chatState.title;
  const tempTitle = chatState.tempTitle;
  const { currUser } = useAuth();
  const [isDisplayAddUser, setIsDisplayAddUser] = useState(null);


  const onFinishEditTitle = async({ title }) => {
    resetField('title');
    setIsEditingTitle(false);
    if (title === "") {
      return;
    }
    await editTitle(title, chatID , db, currUser.displayName, chatDispatch);
  }



  return (
    <>
      {isDisplayAddUser && (
        <AddUserModal setIsDisplayAddUser={setIsDisplayAddUser} />
      )}
      <div className="ring" onMouseOver={() => setIsEditingTitle(true)} onMouseLeave={() => setIsEditingTitle(false)}>

        {memberState.members.size > 2 && isEditingTitle ? (
          <form onSubmit={handleSubmit(onFinishEditTitle)}>
            <input {...register('title', {required: false})} placeholder={title || tempTitle} onBlur={handleSubmit(onFinishEditTitle)}></input>
          </form>

        ) : (
          <div>{title || tempTitle}</div>
        )}

      </div>

      <button onClick={() => setIsDisplayAddUser(true)}>Add User</button>
    </>



  )
}

export default TopBar;
