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
  const { chatRoomData, dispatch } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);

  console.log('topbar run')

  const onFinishEditTitle = async(text) => {
    resetField('title');
    setIsEditingTitle(false);
    if (text.title === "") {
      return;
    }
    await editTitle(text.title, chatRoomData.chatID, db, currUser.displayName);
  }

  useEffect(() => {
    const titleRef = ref(db, "chats/" + chatRoomData.chatID + "/title");

    const chatsChangeListener = onChildChanged(titleRef, (snap) => {
      console.log(snap.val());
      dispatch({type: "UPDATE_TITLE", payload: snap.val()});
    });

    return () => {
      chatsChangeListener();
    }

  }, [dispatch, chatRoomData.chatID]);

  return (
    <div className="ring" onMouseOver={() => setIsEditingTitle(true)} onMouseLeave={() => setIsEditingTitle(false)}>

      {isEditingTitle ? (
        <form onSubmit={handleSubmit(onFinishEditTitle)}>
          <input {...register('title', {required: false})} placeholder={chatRoomData.title} onBlur={handleSubmit(onFinishEditTitle)}></input>
        </form>

      ) : (
        <div>{chatRoomData.title}</div>
      )}

    </div>


  )
}

export default memo(TopBar);