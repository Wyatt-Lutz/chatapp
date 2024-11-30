import { memo, useContext, useState, useEffect } from "react"
import { useForm } from "react-hook-form";
import { ChatContext } from "../../../../providers/ChatProvider";
import { db } from "../../../../../firebase";
import { AuthContext } from "../../../../providers/AuthProvider";
import { editTitle } from "../../../../services/messageDataService";
import { onChildChanged, ref } from 'firebase/database';
const TopBar = () => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { register, handleSubmit, resetField } = useForm();
  const { data, dispatch } = useContext(ChatContext);
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

  useEffect(() => {
    const titleRef = ref(db, "chats/" + data.chatID + "/title");

    const chatsChangeListener = onChildChanged(titleRef, (snap) => {
      console.log(snap.val());
      dispatch({type: "UPDATE_TITLE", payload: snap.val()});
    });

    return () => {
      chatsChangeListener();
    }

  }, [data.chatID]);

  return (
    <div className="ring" onMouseOver={() => setIsEditingTitle(true)} onMouseLeave={() => setIsEditingTitle(false)}>

      {isEditingTitle ? (
        <form onSubmit={handleSubmit(onFinishEditTitle)}>
          <input {...register('title', {required: false})} placeholder={data.title} onBlur={handleSubmit(onFinishEditTitle)}></input>
        </form>

      ) : (
        <div>{data.title}</div>
      )}

    </div>


  )
}

export default memo(TopBar);