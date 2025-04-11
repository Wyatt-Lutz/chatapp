import { useForm } from "react-hook-form";
import { db } from "../../../../../firebase";
import { editMessage } from "../../../../services/messageDataService";
import { calcTime } from "../../../../utils/messageUtils";
import { useChatContexts } from "../../../../hooks/useContexts";

const Message = ({ messageUid, memberDataOfSender, messageData, isEditing, changeEditState, index, onMemberContextMenu, onMessageContextMenu}) => {
  const { register, handleSubmit, resetField } = useForm();
  const { chatState } = useChatContexts();


  const onSubmitEdit = async({ editMessageText }) => {
    resetField('editMessage');
    await editMessage(messageUid, editMessageText, chatState.chatID, db);
    await changeEditState(messageUid, false);
  }


  return (
    <>
      <div className="hover:bg-gray-600">
        {(messageData.renderTimeAndSender || index === 0) && (
          <div>
            {messageData.sender !== 'server' && (
              <div className="flex items-center gap-2" onContextMenu={(e) => onMemberContextMenu(e, messageData.sender, memberDataOfSender)}>
                {memberDataOfSender && (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <img className="h-full w-full object-cover" src={memberDataOfSender.profilePictureURL} alt="profile picture"/>
                    </div>

                    {memberDataOfSender.isBlocked ? (
                      <div>Blocked User</div>
                    ) : (
                      <div>{memberDataOfSender && memberDataOfSender.username}</div>
                    )}
                  </div>

                )}

              </div>
            )}


            <div>{calcTime(messageData.timestamp)}</div>
          </div>

        )}
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <input placeholder={messageData.text} {...register('editMessageText', { required: false, maxLength: 200 })} />
          </form>
        ) : (
          <>
            {memberDataOfSender && memberDataOfSender.isBlocked ? (
              <div>Blocked User</div>
            ) : (
              <div className="text-wrap" onContextMenu={(e) => onMessageContextMenu(e, messageUid, messageData)}>
                <div className="text-xl font-bold py-2 w-max">{messageData.text}</div>
                {messageData.imageRef && (
                  <img src={messageData.imageRef} />
                )}


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
