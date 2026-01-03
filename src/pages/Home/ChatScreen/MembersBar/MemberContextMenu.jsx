import {
  removeUserFromChat,
  unBanUser,
  updateBlockedStatus,
} from "../../../../services/memberDataService";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";
import { transferOwnership } from "../../../../services/chatBarDataService";
import { db } from "../../../../firebase";
import { useRef, useEffect, useState } from "react";

const MemberContextMenu = ({
  contextMenuData: { memberUid, memberData },
  points,
}) => {
  const { chatState, memberDispatch, memberState } = useChatContexts();
  const { currUser } = useAuth();
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ x: points.x, y: points.y });

  useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = points.x;
      let y = points.y;

      if (x + menuRect.width > viewportWidth) {
        x = viewportWidth - menuRect.width - 10;
      }

      if (y + menuRect.height > viewportHeight) {
        y = viewportHeight - menuRect.height - 10;
      }
      if (x < 10) {
        x = 10;
      }

      if (y < 10) {
        y = 10;
      }

      setPosition({ x, y });
    }
  }, [points.x, points.y]);

  const onChangeBlockStatus = async (newBlockStatus) => {
    await updateBlockedStatus(db, currUser.uid, memberUid, newBlockStatus);
    const newMemberObj = { ...memberData, isBlocked: newBlockStatus };
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
      memberState.members,
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
      memberState.members,
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
    );
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl p-1 flex flex-col min-w-max z-50"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <button
        onClick={() => onChangeBlockStatus(!memberData.isBlocked)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700/70 rounded transition group"
      >
        {memberData.isBlocked ? (
          <span>Unblock User</span>
        ) : (
          <span>Block User</span>
        )}
      </button>

      {currUser.uid === chatState.owner && (
        <>
          <div className="border-t border-zinc-700 my-1" />

          {!memberData.isRemoved && (
            <>
              <button
                onClick={onRemoveMemberFromChat}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700/70 rounded transition"
              >
                <span>Remove User</span>
              </button>

              <button
                onClick={onTransferOwnership}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700/70 rounded transition"
              >
                <span>Transfer Ownership</span>
              </button>
            </>
          )}

          <div className="border-t border-zinc-700 my-1" />

          <button
            onClick={memberData.isBanned ? onUnbanUser : onBanMemberFromChat}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded transition"
            style={{
              color: memberData.isBanned ? "#10b981" : "#ef4444",
              backgroundColor: memberData.isBanned
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
            }}
          >
            {memberData.isBanned ? (
              <span>Unban User</span>
            ) : (
              <span>Ban User</span>
            )}
          </button>
        </>
      )}
    </div>
  );
};
export default MemberContextMenu;
