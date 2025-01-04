import { memo, useContext, useState, useEffect } from "react"
import { useForm } from "react-hook-form";
import { db } from "../../../../../firebase";
import { AuthContext } from "../../../../providers/AuthProvider";
import { editTitle } from "../../../../services/messageDataService";
import { ChatContext } from "../../../../providers/ChatContext";
const TopBar = () => {
  console.log('topBar run');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { register, handleSubmit, resetField } = useForm();
  const { chatState } = useContext(ChatContext);
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
    await editTitle(title, chatID , db, currUser.displayName);
  }


  return (
    <div className="ring" onMouseOver={() => setIsEditingTitle(true)} onMouseLeave={() => setIsEditingTitle(false)}>

      {isEditingTitle ? (
        <form onSubmit={handleSubmit(onFinishEditTitle)}>
          <input {...register('title', {required: false})} placeholder={title || tempTitle} onBlur={handleSubmit(onFinishEditTitle)}></input>
        </form>

      ) : (
        <div>{title || tempTitle}</div>
      )}

    </div>


  )
}

export default memo(TopBar);