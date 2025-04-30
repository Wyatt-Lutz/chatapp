import { useContext, useState } from "react"
import Member from "./Member";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import MemberContextMenu from "./MemberContextMenu";
import { useChatContexts } from "../../../../hooks/useContexts";
const MembersBar = () => {
  const { memberState } = useChatContexts();
  const members = memberState.members;

  const { contextMenu, setContextMenu, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});

  const handleContextMenu = (e, memberUid, memberData) => {
    e.preventDefault();
    setContextMenu({'member': true});
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({memberUid: memberUid, memberData: memberData});
  }
  return (
    <div>
      <div>Members:</div>
      <>
        {!members ? (
          <div>Loading members...</div>
        ) : (
          <>
            {[...members].filter(([_, memberData]) => !memberData.hasBeenRemoved).map(([memberUid, memberData]) => (
              <div key={memberUid} onContextMenu={(e) => handleContextMenu(e, memberUid, memberData)} className="hover:bg-gray-600">
                <Member memberUid={memberUid} memberData={memberData} />
              </div>
            ))}
          </>
        )}
      </>



      {contextMenu.member && (
        <MemberContextMenu contextMenuData={contextMenuData} points={points} />
      )}


    </div>
  )
}
export default MembersBar;
