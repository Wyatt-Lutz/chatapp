import { useContext } from "react"
import { useForm } from "react-hook-form";
import { ChatContext } from "../../../../context/ChatContext";
import { db } from "../../../../../firebase";
import { editMessage } from "../../../../services/messageDataService";


const Message = ({ messageUid, memberDataOfSender, messageData, isEditing, changeEditState }) => {
  console.log('message run');
  const { register, handleSubmit, resetField } = useForm();
  const { chatState } = useContext(ChatContext);



  const onSubmitEdit = async({ editMessageText }) => {
    resetField('editMessage');
    await editMessage(messageUid, editMessageText, chatState.chatID, db);
    await changeEditState(messageUid, false);
  }


  return (
    <>
      <div className="hover:bg-gray-600">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <input placeholder={messageData.text} {...register('editMessageText', { required: false, maxLength: 200 })} />
          </form>
        ) : (
          <>
            {memberDataOfSender && memberDataOfSender.isBlocked ? (
              <div>Blocked User</div>
            ) : (
              <div className="text-wrap">
              <div className="text-xl font-bold py-2 w-max">{messageData.text}</div>

              {messageData.hasBeenEdited && (
                <div>Edited</div>
              )}
              </div>
            )}
          </>


        )}
      </div>
    </>
  )
}
export default Message;