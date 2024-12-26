import { useContext, memo } from "react";
import { ChatContext } from "../../../../providers/ChatContext";
import { AuthContext } from "../../../../providers/AuthProvider";
import { removeUserFromChat, transferOwnership, updateBlockedStatus } from "../../../../services/memberDataService";
import { db } from "../../../../../firebase";
import { MembersContext } from "../../../../providers/MembersContext";



const MemberContextMenu = ({contextMenuData, points}) => {
  const { chatRoomData, dispatch } = useContext(ChatContext);
  const { dispatchMember } = useContext(MembersContext);
  const { currUser } = useContext(AuthContext);
  console.log('membercontextmenu run');

  const {memberUid, memberData} = contextMenuData;
  

  const onChangeBlockStatus = async(newBlockStatus) => {
    await updateBlockedStatus(db, currUser.uid, memberUid, newBlockStatus);
    const newMemberObj = {[memberUid]: {...memberData, isBlocked: newBlockStatus}}
    dispatchMember({type: "UPDATE_MEMBER_DATA", payload: newMemberObj});
  }

  const onRemoveMemberFromChat = async() => {
    await removeUserFromChat(db, chatRoomData.chatID, memberUid, memberData.username, currUser.uid);
  }


  const onTransferOwnship = async() => {
    await transferOwnership(db, chatRoomData.chatID, memberUid);
    dispatch({type: "UPDATE_OWNER", payload: memberUid});
  }

  return (
    <>
      {memberUid !== currUser.uid && (
        <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points?.y, left: points?.x}}>
          {memberData.isBlocked ? (
            <button onClick={() => onChangeBlockStatus(false)}>Unblock User</button>
          ) : (
            <button onClick={() => onChangeBlockStatus(true)}>Block User</button>
          )}

          {currUser.uid === data.owner && (
            <>
              <button onClick={onRemoveMemberFromChat}>Remove User</button>
              <button onClick={onTransferOwnship}>Transfer Ownership</button>
            </>
          )}
        </div>
      )}
    </>


  )
}
export default memo(MemberContextMenu);