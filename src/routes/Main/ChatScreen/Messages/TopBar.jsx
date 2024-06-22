import { memo, useContext, useState } from "react"
import { useForm } from "react-hook-form";
import { ChatContext } from "../../../../ChatProvider";
import { db } from "../../../../../firebase";
import { AuthContext } from "../../../../AuthProvider";
import { editTitle } from "../../../../services/messageDataService";
const TopBar = () => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { register, handleSubmit, resetField } = useForm();
  const { data } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);

  console.log('topbar run')

  const onFinishEditTitle = async(text) => {
    resetField('title');
    setIsEditingTitle(false);
    if (text.title === "") {
      return;
    }
    await editTitle(text.title, data.chatID, db, currUser.displayName);
  }

  return (
    <>

      {isEditingTitle ? (
        <form onSubmit={handleSubmit(onFinishEditTitle)}>
          <input {...register('title', {required: false})} placeholder={data.title} onBlur={handleSubmit(onFinishEditTitle)}></input>
        </form>

      ) : (
        <div onMouseOver={() => setIsEditingTitle(true)}>{data.title}</div>
      )}

    </>


  )
}

export default memo(TopBar);