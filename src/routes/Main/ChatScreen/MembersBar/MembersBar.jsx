import { memo, useContext, useState } from "react"
import Member from "./Member";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import MemberContextMenu from "./MemberContextMenu";
import { MembersContext } from "../../../../providers/MembersContext";
const MembersBar = () => {
  console.log('membersBar run')

  const { membersData } = useContext(MembersContext);

  console.log(membersData.members);
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
      {Array.from(membersData.members.entries()).map(([memberUid, memberData]) => (
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

/*
array1.forEach(obj => {
  Object.entries(obj).forEach(([key, value]) => {
    console.log(`Key: ${key}, Username: ${value.username}, Age: ${value.age}`);
  });
});
*/

/*
          <div key={id}>
            {!memberData?.hasBeenRemoved && (
              <div onContextMenu={(e) => handleContextMenu(e, member)} className="hover:bg-gray-600">
                <Member member={member} />
              </div>
            )}
          </div>
*/