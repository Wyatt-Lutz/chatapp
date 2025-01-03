import { memo, useContext, useState } from "react"
import { calcTime } from "../../../../services/messageDataService";
import { useForm } from "react-hook-form";
import { ChatContext } from "../../../../providers/ChatContext";
import { db } from "../../../../../firebase";
import MessagesContextMenu from "./MessagesContextMenu";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import { AuthContext } from "../../../../providers/AuthProvider";


const Message = ({ messageUid, messageData, isFirst, isEditing, changeEditState }) => {
  console.log('message run');
  const { register, handleSubmit, resetField } = useForm();
  const { chatState, memberState } = useContext(ChatContext);

  const { currUser } = useContext(AuthContext);
  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});

  const memberDataOfSender = memberState.members.get(messageData.sender);



  const onSubmitEdit = async({ editMessage }) => {
    resetField('editMessage');
    await editMessage(messageUid, editMessage, chatState.chatID, db);
    await changeEditState(messageUid, false);
  }


  const handleContextMenu = (e, messageUid, messageData) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({ messageUid, text: messageData.text, sender: messageData.sender });
  }

  return (
    <>
      <div onContextMenu={(e) => handleContextMenu(e, messageUid, messageData)} className="hover:bg-gray-600">
        {(messageData.renderTimeAndSender || isFirst) && (
          <div className="flex">

            {memberDataOfSender && memberDataOfSender.isBlocked ? (
              <div>Blocked User</div>
            ) : (
              <div>{memberDataOfSender && memberDataOfSender.username}</div>
            )}

            <div>{calcTime(messageData.timestamp)}</div>
          </div>
        )}

        <div>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmitEdit)}>
              <input placeholder={messageData.text} {...register('editMessage', { required: false, maxLength: 200 })} />
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
        {(clicked && contextMenuData.sender === currUser.displayName) && (
          <MessagesContextMenu changeEditState={changeEditState} contextMenuData={contextMenuData} points={points} />
        )}
      </div>
    </>
  )
}
export default memo(Message);