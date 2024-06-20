import { Fragment, memo, useCallback, useContext } from "react"
import { calcTime, editMessage } from "./useChatData";
import { useForm } from "react-hook-form";
import { ChatContext } from "../../../ChatProvider";
import { db } from "../../../../firebase";




const Chat = ({ chat, isFirst, isEditing, changeEditState }) => {
  console.log('chat run');
  const { register, handleSubmit, resetField } = useForm();
  const { data } = useContext(ChatContext);

  const onSubmitEdit = async(text) => {
    resetField('editMessage');
    editMessage(chat.id, text.editMessage, data.chatID, db);
    changeEditState(chat.id, false);
  }



  return (
    <>
      {(chat.renderTimeAndSender || isFirst) && (
        <div className="flex">
          <img src="" alt="helllo"/>
          <div>{data.members[chat.sender] && data.members[chat.sender].username}</div>
          <div>{calcTime(chat.timestamp)}</div>
        </div>
      )}

      <div>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <input placeholder={chat.text} {...register('editMessage', { required: false, maxLength: 200 })} />
          </form>
        ) : (
          <div className="text-wrap">
            <div className="text-xl font-bold py-2 w-max">{chat.text}</div>
            {chat.hasBeenEdited && (
              <div>Edited</div>
            )}
          </div>
        )}
      </div>

    </>
  )
}
export default memo(Chat);