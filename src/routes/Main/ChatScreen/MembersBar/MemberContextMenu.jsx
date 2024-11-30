import { useContext, memo } from "react";
import { ChatContext } from "../../../../providers/ChatProvider";
import { AuthContext } from "../../../../providers/AuthProvider";
import { removeUserFromChat, transferOwnership, updateBlockedStatus } from "../../../../services/memberDataService";
import { db } from "../../../../../firebase";



const MemberContextMenu = ({contextMenuData, points, clientUserIsOwner}) => {
  const { data, dispatch } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);
  console.log('membercontextmenu run');
  const member = contextMenuData.member;

  const onChangeBlockStatus = async(newBlockStatus) => {
    await updateBlockedStatus(db, currUser.uid, member.uid, newBlockStatus);
    dispatch({type: "CHANGE_MEMBER", payload: { uid: member.uid, isOnline: member.isOnline, isBlocked: newBlockStatus, hasBeenRemoved: member.hasBeenRemoved, username: member.username }});
  }

  return (
    <>
      {member.uid !== currUser.uid && (
        <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points?.y, left: points?.x}}>
          {member.isBlocked ? (
            <button onClick={() => onChangeBlockStatus(false)}>Unblock User</button>
          ) : (
            <button onClick={() => onChangeBlockStatus(true)}>Block User</button>
          )}

          {currUser.uid === data.owner && (
            <>
              <button onClick={() => removeUserFromChat(db, data.chatID, member.uid, member.username, currUser.uid, dispatch)}>Remove User</button>
              <button onClick={() => {
                transferOwnership(db, data.chatID, member.uid);
                dispatch({type: "UPDATE_OWNER", payload: member.uid});
              }}>Transfer Ownership</button>
            </>

          )}

        </div>
      )}
    </>


  )
}
export default memo(MemberContextMenu);