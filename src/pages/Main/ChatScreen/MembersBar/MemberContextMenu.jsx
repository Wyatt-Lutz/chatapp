import { removeUserFromChat, transferOwnership, updateBlockedStatus } from "../../../../services/memberDataService";
import { db } from "../../../../../firebase";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";



const MemberContextMenu = ({contextMenuData: {memberUid, memberData}, points}) => {
  const { chatState, memberDispatch, chatDispatch, resetAllChatContexts } = useChatContexts();
  const { currUser } = useAuth();


  const onChangeBlockStatus = async(newBlockStatus) => {
    await updateBlockedStatus(db, currUser.uid, memberUid, newBlockStatus);
    const newMemberObj = {...memberData, isBlocked: newBlockStatus}
    console.log(newMemberObj);
    memberDispatch({type: "UPDATE_MEMBER_DATA", payload: {key: memberUid, data: newMemberObj, currUserUid: currUser.uid, resetChatContexts: () => resetAllChatContexts() }});
  }

  const onRemoveMemberFromChat = async() => {
    await removeUserFromChat(db, chatState.chatID, memberUid, memberData.username, currUser.uid, chatState.numOfMembers, chatDispatch, resetAllChatContexts);
  }


  const onTransferOwnership = async() => {
    await transferOwnership(db, chatState.chatID, memberUid, chatDispatch);
  }

  return (
    <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points.y, left: points.x}}>
      {memberData.isBlocked ? (
        <button onClick={() => onChangeBlockStatus(false)}>Unblock User</button>
      ) : (
        <button onClick={() => onChangeBlockStatus(true)}>Block User</button>
      )}

      {currUser.uid === chatState.owner && (
        <>
          <button onClick={onRemoveMemberFromChat}>Remove User</button>
          <button onClick={onTransferOwnership}>Transfer Ownership</button>
        </>
      )}
    </div>


  )
}
export default MemberContextMenu;
