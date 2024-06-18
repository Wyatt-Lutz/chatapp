import { memo, useContext, useEffect, useState } from "react"
import Member from "./Member";
import { useContextMenu } from "../useContextMenu";
import MemberContextMenu from "./MemberContextMenu";
import { ref, onChildAdded, onChildRemoved } from "firebase/database";
import { db } from "../../../../../firebase";
import { ChatContext } from "../../../../ChatProvider";
const MembersBar = () => {
  const { data } = useContext(ChatContext)
  const [members, setMembers] = useState([]);
  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});
  const membersRef  = ref(db, "members/" + data.chatID);

  const handleMemberAdded = (snap) => {
    console.log('handleMemberAdded')
    setMembers(prev => [...prev, snap.val().username]);
  };

  const handleMemberRemoved = (snap) => {
    console.log('handleMemberRemoved')

    setMembers(prev => {
      const updatedMembers = [...prev];
      updatedMembers.filter((member) => member.key !== snap.key);
    });
  };

  useEffect(() => {

    const memberAddedListener = onChildAdded(membersRef, handleMemberAdded);
    const memberRemovedListener = onChildRemoved(membersRef, handleMemberRemoved);


    return () => {
      memberAddedListener();
      memberRemovedListener();
    }

  });

  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
  }
  return (
    <div>


      {members?.map((member) => (
        <div key={member} onContextMenu={(e) => handleContextMenu(e, chat)} className="hover:bg-gray-600">
          <Member member={member} />
        </div>
      ))}

      {clicked && (
        <MemberContextMenu contextMenuData={contextMenuData} points={points} />
      )}


    </div>
  )
}
export default memo(MembersBar);