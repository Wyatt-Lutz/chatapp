import {
  removeUserFromChat,
  transferOwnership,
  unBanUser,
  updateBlockedStatus,
} from "../../../../services/memberDataService";
import { db } from "../../../../../firebase";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";

const MemberContextMenu = ({
  contextMenuData: { memberUid, memberData },
  points,
}) => {
  const {
    chatState,
    memberDispatch,
    memberState,
    chatDispatch,
    messageDispatch,
    resetAllChatContexts,
  } = useChatContexts();
  const { currUser } = useAuth();

  const onChangeBlockStatus = async (newBlockStatus) => {
    await updateBlockedStatus(db, currUser.uid, memberUid, newBlockStatus);
    const newMemberObj = { ...memberData, isBlocked: newBlockStatus };
    console.log(newMemberObj);
    memberDispatch({
      type: "UPDATE_MEMBER_DATA",
      payload: { uid: memberUid, data: newMemberObj },
    });
  };

  const onRemoveMemberFromChat = async () => {
    await removeUserFromChat(
      db,
      chatState,
      memberUid,
      memberData.username,
      currUser.uid,
      chatDispatch,
      resetAllChatContexts,
      memberState.members,
      messageDispatch,
    );
  };

  const onTransferOwnership = async () => {
    await transferOwnership(db, chatState.chatID, memberUid);
  };

  const onBanMemberFromChat = async () => {
    await removeUserFromChat(
      db,
      chatState,
      memberUid,
      memberData.username,
      currUser.uid,
      chatDispatch,
      resetAllChatContexts,
      memberState.members,
      messageDispatch,
      {}, //memberOptions
      true, //isBanned
    );
  };

  const onUnbanUser = async () => {
    await unBanUser(
      db,
      chatState.chatID,
      memberUid,
      memberData.username,
      memberState.members,
      messageDispatch,
    );
  };

  return (
    <div
      className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col"
      style={{ top: points.y, left: points.x }}
    >
      {memberData.isBlocked ? (
        <button onClick={() => onChangeBlockStatus(false)}>Unblock User</button>
      ) : (
        <button onClick={() => onChangeBlockStatus(true)}>Block User</button>
      )}

      {currUser.uid === chatState.owner && (
        <div>
          {!memberData.isRemoved && (
            <div className="flex flex-col">
              {" "}
              <button onClick={onRemoveMemberFromChat}>Remove User</button>
              <button onClick={onTransferOwnership}>Transfer Ownership</button>
            </div>
          )}

          {memberData.isBanned ? (
            <button className="text-red-700" onClick={onUnbanUser}>
              Unban User
            </button>
          ) : (
            <button className="text-red-700" onClick={onBanMemberFromChat}>
              Ban User
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default MemberContextMenu;
