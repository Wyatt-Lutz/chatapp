import { memo, useContext, useEffect, useRef, useState } from "react"
import Member from "./Member";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import MemberContextMenu from "./MemberContextMenu";
import { ChatContext } from "../../../../ChatProvider";
import { AuthContext } from "../../../../AuthProvider";
const MembersBar = () => {
  console.log('membersBar run')

  const { data } = useContext(ChatContext);
  console.log(data.members);
  const { currUser } = useContext(AuthContext);
  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});

  const handleContextMenu = (e, member) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({uid: member.uid});
  }
  return (
    <div>


      {data.members?.map(member => (
        <div key={member.uid}>
          {!member.hasBeenRemoved && (
            <div onContextMenu={(e) => handleContextMenu(e, member)} className="hover:bg-gray-600">
              <Member member={member} />
            </div>
          )}
        </div>
      ))}

      {clicked && (
        <MemberContextMenu contextMenuData={contextMenuData} clientUserIsOwner={data.owner === currUser.uid ? true : false} points={points} />
      )}


    </div>
  )
}
export default memo(MembersBar);