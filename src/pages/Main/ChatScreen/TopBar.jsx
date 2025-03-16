import { useContext, useState } from "react"
import { useForm } from "react-hook-form";
import { db } from "../../../../firebase";
import { AuthContext } from "../../../../src/context/AuthContext";
import { editTitle } from "../../../services/messageDataService";
import { ChatContext } from "../../../../src/context/ChatContext";
const TopBar = () => {
  console.log('topBar run');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { register, handleSubmit, resetField } = useForm();
  const { chatState, chatDispatch, memberState } = useContext(ChatContext);
  const chatID = chatState.chatID;
  const title = chatState.title;
  const tempTitle = chatState.tempTitle;
  const { currUser } = useContext(AuthContext);


  const onFinishEditTitle = async({ title }) => {
    resetField('title');
    setIsEditingTitle(false);
    if (title === "") {
      return;
    }
    await editTitle(title, chatID , db, currUser.displayName, chatDispatch);
  }


  return (
    <div className="ring" onMouseOver={() => setIsEditingTitle(true)} onMouseLeave={() => setIsEditingTitle(false)}>

      {memberState.members.size > 2 && isEditingTitle ? (
        <form onSubmit={handleSubmit(onFinishEditTitle)}>
          <input {...register('title', {required: false})} placeholder={title || tempTitle} onBlur={handleSubmit(onFinishEditTitle)}></input>
        </form>

      ) : (
        <div>{title || tempTitle}</div>
      )}

    </div>


  )
}

export default TopBar;