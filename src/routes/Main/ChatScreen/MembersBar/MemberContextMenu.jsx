import { useContext } from "react";
import { ChatContext } from "../../../../providers/ChatContext";
import { AuthContext } from "../../../../providers/AuthProvider";
import { removeUserFromChat, transferOwnership, updateBlockedStatus } from "../../../../services/memberDataService";
import { db } from "../../../../../firebase";



const MemberContextMenu = ({contextMenuData: {memberUid, memberData}, points}) => {
  const { currChat, dispatch } = useContext(ChatContext);
  const chatData = currChat.chatData;
  const { currUser } = useContext(AuthContext);
  console.log('membercontextmenu run');


  const onChangeBlockStatus = async(newBlockStatus) => {
    await updateBlockedStatus(db, currUser.uid, memberUid, newBlockStatus);
    const newMemberObj = {[memberUid]: {...memberData, isBlocked: newBlockStatus}}
    dispatch({type: "UPDATE_MEMBER_DATA", payload: newMemberObj});
  }

  const onRemoveMemberFromChat = async() => {
    await removeUserFromChat(db, chatData.chatID, memberUid, memberData.username, currUser.uid, dispatch);
  }


  const onTransferOwnership = async() => {
    await transferOwnership(db, chatData.chatID, memberUid);
    dispatch({type: "UPDATE_OWNER", payload: memberUid});
  }

  return (
    <>
      {memberUid !== currUser.uid && (
        <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points.y, left: points.x}}>
          {memberData.isBlocked ? (
            <button onClick={() => onChangeBlockStatus(false)}>Unblock User</button>
          ) : (
            <button onClick={() => onChangeBlockStatus(true)}>Block User</button>
          )}

          {currUser.uid === chatData.owner && (
            <>
              <button onClick={onRemoveMemberFromChat}>Remove User</button>
              <button onClick={onTransferOwnership}>Transfer Ownership</button>
            </>
          )}
        </div>
      )}
    </>


  )
}
export default MemberContextMenu;