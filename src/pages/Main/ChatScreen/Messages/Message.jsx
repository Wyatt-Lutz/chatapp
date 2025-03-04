import { useContext, useState } from "react"
import { useForm } from "react-hook-form";
import { ChatContext } from "../../../../context/ChatContext";
import { db } from "../../../../../firebase";
import { calcTime, editMessage } from "../../../../services/messageDataService";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import { AuthContext } from "../../../../context/AuthContext";


const Message = ({ messageUid, memberDataOfSender, messageData, isEditing, changeEditState }) => {
  console.log('message run');
  const { register, handleSubmit, resetField } = useForm();
  const { chatState } = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);
  const [usernameContextMenuData, setUsernameContextMenuData] = useState({});
  const { contextMenu, setContextMenu, points, setPoints } = useContextMenu();

  const onSubmitEdit = async({ editMessageText }) => {
    resetField('editMessage');
    await editMessage(messageUid, editMessageText, chatState.chatID, db);
    await changeEditState(messageUid, false);
  }
  const handleUsernameContextMenu = (e, memberUid, memberData) => {
    e.preventDefault();
    setContextMenu(prev => ({...prev, 'username': true}));
    setPoints(prev => ({...prev, 'username': {x: e.pageX, y: e.pageY}}));
    setUsernameContextMenuData({memberUid, memberData})
  }

  return (
    <>
      <div className="hover:bg-gray-600">
        {(messageData.renderTimeAndSender || index === 0) && (
          <div>
            {messageData.sender !== 'server' && (
              <div className="flex" onContextMenu={(e) => handleUsernameContextMenu(e, messageData.sender, memberDataOfSender)}>
                {memberDataOfSender && (
                  <div>
                    <img src={memberDataOfSender.profilePictureURL} alt="profile picture"/>
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
              <div className="text-wrap">
              <div className="text-xl font-bold py-2 w-max">{messageData.text}</div>

              {messageData.hasBeenEdited && (
                <div>Edited</div>
              )}
              </div>
            )}
          </>


        )}
        {(contextMenu.username && usernameContextMenuData.memberUid !== currUser.uid) && (
          <MemberContextMenu contextMenuData={usernameContextMenuData} points={points.username} />
        )}
      </div>
    </>
  )
}
export default Message;