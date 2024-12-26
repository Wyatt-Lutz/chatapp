import { memo, useContext, useEffect, useRef, useState } from "react"
import Member from "./Member";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import MemberContextMenu from "./MemberContextMenu";
import { ChatContext } from "../../../../providers/ChatProvider";
import { AuthContext } from "../../../../providers/AuthProvider";
import { onChildAdded, onChildChanged, ref } from "firebase/database";
import { db } from "../../../../../firebase";
import { getBlockData } from "../../../../services/memberDataService";
import { MembersContext } from "../../../../providers/MembersContext";
const MembersBar = () => {
  console.log('membersBar run')

  const { memberData } = useContext(MembersContext);

  console.log(memberData.members);
  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});

  const handleContextMenu = (e, member) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData(member);
  }
  return (
    <div>
      {memberData.members.map(member => {
        const {id, memberData} = member;
        return (
          <div key={id}>
            {!memberData.hasBeenRemoved && (
              <div onContextMenu={(e) => handleContextMenu(e, member)} className="hover:bg-gray-600">
                <Member member={member} />
              </div>
            )}
          </div>
        )
      })}

      {clicked && (
        <MemberContextMenu contextMenuData={contextMenuData} points={points} />
      )}


    </div>
  )
}
export default memo(MembersBar);