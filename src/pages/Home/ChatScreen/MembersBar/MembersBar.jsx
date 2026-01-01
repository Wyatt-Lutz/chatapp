import { useState } from "react";
import Member from "./Member";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import MemberContextMenu from "./MemberContextMenu";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";
const MembersBar = () => {
  const { memberState } = useChatContexts();
  const members = memberState.members;
  const { currUser } = useAuth();
  const { contextMenu, setContextMenu, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});

  const handleContextMenu = (e, memberUid, memberData) => {
    e.preventDefault();
    setContextMenu({ member: true });
    setPoints({ x: e.pageX, y: e.pageY });
    setContextMenuData({ memberUid: memberUid, memberData: memberData });
  };
  return (
    <aside className="w-72 bg-zinc-800/40 border-l border-zinc-700 p-3">
      <div className="text-sm font-semibold text-zinc-100 text-center mb-3">
        Members
      </div>
      <div className="space-y-2">
        {!members ? (
          <div className="text-sm text-zinc-400">Loading members...</div>
        ) : (
          <>
            {[...members]
              .filter(([_, memberData]) => !memberData.isRemoved)
              .map(([memberUid, memberData]) => (
                <div
                  key={memberUid}
                  onContextMenu={(e) =>
                    handleContextMenu(e, memberUid, memberData)
                  }
                >
                  <Member memberUid={memberUid} memberData={memberData} />
                </div>
              ))}
          </>
        )}
      </div>

      {contextMenu.member && contextMenuData.memberUid !== currUser.uid && (
        <MemberContextMenu contextMenuData={contextMenuData} points={points} />
      )}
    </aside>
  );
};
export default MembersBar;
