import { Fragment, memo } from "react"
import { calcTime } from "./useChatData";
import { useForm } from "react-hook-form";



const Chat = ({chat, index, isEditing, changeEditState }) => {
  const { register, handleSubmit, resetField } = useForm();
  const onSubmitEdit = async(text) => {
    resetField('editMessage');
    editMessage(chat.id, text.editMessage, data.chatID, db);
    changeEditState(chat.id, false);
  }
  console.log('chat run');


  return (
    <Fragment>
      {(chat.renderTimeAndSender || index === 0) && (
        <div className="flex">
          <img src="" alt="helllo"/>
          <div>{chat.sender}</div>
          <div>{calcTime(chat.timestamp)}</div>
        </div>
      )}

      <div>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <input placeholder={chat.text} {...register('editMessage', { required: false, maxLength: 200 })} />
          </form>
        ) : (
          <div>
          <div className="text-xl font-bold py-2 w-max">{chat.text}</div>
          {chat.hasBeenEdited && (
            <div>Edited</div>
          )}
        </div>
        )}
      </div>

    </Fragment>
  )
}
export default memo(Chat);