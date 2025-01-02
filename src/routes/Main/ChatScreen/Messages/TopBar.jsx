import { memo, useContext, useState, useEffect } from "react"
import { useForm } from "react-hook-form";
import { db } from "../../../../../firebase";
import { AuthContext } from "../../../../providers/AuthProvider";
import { editTitle } from "../../../../services/messageDataService";
import { onChildChanged, ref } from 'firebase/database';
import { ChatContext } from "../../../../providers/ChatContext";
const TopBar = () => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { register, handleSubmit, resetField } = useForm();
  const { currChat, dispatch } = useContext(ChatContext);
  const chatID = currChat.chatData.chatID;
  const { currUser } = useContext(AuthContext);


  const onFinishEditTitle = async({ title }) => {
    resetField('title');
    setIsEditingTitle(false);
    if (title === "") {
      return;
    }
    await editTitle(title, chatID , db, currUser.displayName);
  }

  useEffect(() => {
    const titleRef = ref(db, `chats/${chatID}/title`);

    const chatsChangeListener = onChildChanged(titleRef, (snap) => {
      console.log(snap.val());
      dispatch({type: "UPDATE_TITLE", payload: snap.val()});
    });

    return () => {
      chatsChangeListener();
    }

  }, [dispatch, chatID]);

  return (
    <div className="ring" onMouseOver={() => setIsEditingTitle(true)} onMouseLeave={() => setIsEditingTitle(false)}>

      {isEditingTitle ? (
        <form onSubmit={handleSubmit(onFinishEditTitle)}>
          <input {...register('title', {required: false})} placeholder={currChat.chatData.title || currChat.chatData.tempTitle} onBlur={handleSubmit(onFinishEditTitle)}></input>
        </form>

      ) : (
        <div>{currChat.chatData.title || currChat.chatData.tempTitle}</div>
      )}

    </div>


  )
}

export default TopBar;