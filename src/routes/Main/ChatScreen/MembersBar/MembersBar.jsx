import { memo, useContext, useState } from "react"
import Member from "./Member";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import MemberContextMenu from "./MemberContextMenu";
import { ChatContext } from "../../../../providers/ChatContext";
const MembersBar = () => {
  const { currChat } = useContext(ChatContext);
  const members = currChat.memberData.members;

  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});

  const handleContextMenu = (e, memberUid, memberData) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({memberUid: memberUid, memberData: memberData});
  }
  return (
    <div>
      <div>Members:</div>
      {[...members].map(([memberUid, memberData]) => (
        <div key={memberUid}>
          <div onContextMenu={(e) => handleContextMenu(e, memberUid, memberData)} className="hover:bg-gray-600">
            <Member memberUid={memberUid} memberData={memberData} />
          </div>
        </div>
      ))}


      {clicked && (
        <MemberContextMenu contextMenuData={contextMenuData} points={points} />
      )}


    </div>
  )
}
export default MembersBar;