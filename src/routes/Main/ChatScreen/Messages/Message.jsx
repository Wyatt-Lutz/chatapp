import { memo, useContext } from "react"
import { calcTime, editMessage } from "../../../../services/messageDataService";
import { useForm } from "react-hook-form";
import { ChatContext } from "../../../../providers/ChatContext";
import { db } from "../../../../../firebase";
import { MembersContext } from "../../../../providers/MembersContext";


const Message = ({ chat, isFirst, isEditing, changeEditState }) => {
  const {id, message} = chat;
  console.log('chat run');
  const { register, handleSubmit, resetField } = useForm();
  const { chatRoomData } = useContext(ChatContext);
  const { memberData } = useContext(MembersContext);

  const onSubmitEdit = async(text) => {
    resetField('editMessage');
    editMessage(id, text.editMessage, chatRoomData.chatID, db);
    changeEditState(id, false);
  }
  const memberObjOfSender = memberData.members[chat.sender];

  return (
    <>
      {(message.renderTimeAndSender || isFirst) && (
        <div className="flex">
          <img src="" alt="helllo"/>
          {memberObjOfSender && memberObjOfSender.isBlocked ? (
            <div>Blocked User</div>
          ) : (
            <div>{memberObjOfSender && memberObjOfSender.username}</div>
          )}

          <div>{calcTime(message.timestamp)}</div>
        </div>
      )}

      <div>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <input placeholder={message.text} {...register('editMessage', { required: false, maxLength: 200 })} />
          </form>
        ) : (
          <>
            {memberObjOfSender && memberObjOfSender.isBlocked ? (
              <div></div>
            ) : (
              <div className="text-wrap">
              <div className="text-xl font-bold py-2 w-max">{message.text}</div>

              {message.hasBeenEdited && (
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