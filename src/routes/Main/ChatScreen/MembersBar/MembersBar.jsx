import { memo, useContext, useEffect, useRef, useState } from "react"
import Member from "./Member";
import { useContextMenu } from "../useContextMenu";
import MemberContextMenu from "./MemberContextMenu";
import { ref, onChildAdded, onChildRemoved, onChildChanged } from "firebase/database";
import { db } from "../../../../../firebase";
import { ChatContext } from "../../../../ChatProvider";
import { AuthContext } from "../../../../AuthProvider";
const MembersBar = () => {
  console.log('membersBar run')
  const { data } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);
  const clientUserIsOwner = useRef(false);
  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});

  useEffect(() => {
    for (let member of data.members) {
      if (member.hasOwnProperty(currUser.uid)) {
        if (member[currUser.uid].hasOwnProperty('isOwner')) {
          clientUserIsOwner.current = true;
        }
      }
    }
  }, [data.members]);


  const handleContextMenu = (e, member) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({uid: Object.keys(member)[0]});
  }
  return (
    <div>


      {data.members?.map(member => (
        <div key={Object.keys(member)[0]} onContextMenu={(e) => handleContextMenu(e, member)} className="hover:bg-gray-600">
          <Member member={member} />
        </div>
      ))}

      {clicked && (
        <MemberContextMenu contextMenuData={contextMenuData} clientUserIsOwner={clientUserIsOwner.current} points={points} />
      )}


    </div>
  )
}
export default memo(MembersBar);