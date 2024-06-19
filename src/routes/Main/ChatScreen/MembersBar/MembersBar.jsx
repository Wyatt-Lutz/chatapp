import { memo, useContext, useEffect, useRef, useState } from "react"
import Member from "./Member";
import { useContextMenu } from "../useContextMenu";
import MemberContextMenu from "./MemberContextMenu";
import { ref, onChildAdded, onChildRemoved, onChildChanged } from "firebase/database";
import { db } from "../../../../../firebase";
import { ChatContext } from "../../../../ChatProvider";
import { AuthContext } from "../../../../AuthProvider";
const MembersBar = () => {
  const { data } = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const clientUserIsOwner = useRef(false);
  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});

  const membersRef  = ref(db, "members/" + data.chatID);

  const handleMemberAdded = (snap) => {
    console.log('handleMemberAdded')

    setMembers(prev => ([
      ...prev,
      {[snap.key]: snap.val()},
    ]));
    if (snap.val().username === currUser.displayName && snap.val().isOwner) {
      clientUserIsOwner.current = true;
    }
  };

  const handleMemberChanged = (snap) => {
    setMembers(prev => {
      const index = prev.findIndex(member => Object.keys(member)[0] === snap.key);
      if (index === -1) {
        return;
      }
      const updatedChats = [...prev];
      updatedChats[index] = {[snap.key]: snap.val()};
      return updatedChats;
    })

  }

  const handleMemberRemoved = (snap) => {
    console.log('handleMemberRemoved')
    console.log(snap.key);
    setMembers(prev => {
      const updatedMembers = [...prev];
      const filteredMembers = updatedMembers.filter(member => Object.keys(member)[0] !== snap.key);
      console.log(filteredMembers);
      return filteredMembers;
    })


  };

  useEffect(() => {

    const memberAddedListener = onChildAdded(membersRef, handleMemberAdded);
    const memberChangedListener = onChildChanged(membersRef, handleMemberChanged);
    const memberRemovedListener = onChildRemoved(membersRef, handleMemberRemoved);


    return () => {
      memberAddedListener();
      memberChangedListener();
      memberRemovedListener();
    }

  }, [data.chatID]);

  const handleContextMenu = (e, member) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({uid: Object.keys(member)[0]});
  }
  return (
    <div>


      {members?.map(member => (
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