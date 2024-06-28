import { memo, useContext, useEffect, useRef, useState } from "react"
import Member from "./Member";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import MemberContextMenu from "./MemberContextMenu";
import { ChatContext } from "../../../../ChatProvider";
import { AuthContext } from "../../../../AuthProvider";
import { onChildAdded, onChildChanged, ref } from "firebase/database";
import { db } from "../../../../../firebase";
const MembersBar = () => {
  console.log('membersBar run')

  const { data, dispatch } = useContext(ChatContext);
  console.log(data.members);
  const { currUser } = useContext(AuthContext);
  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [contextMenuData, setContextMenuData] = useState({});

  const handleContextMenu = (e, member) => {
    e.preventDefault();
    setClicked(true);
    setPoints({x: e.pageX, y: e.pageY});
    setContextMenuData({uid: member.uid, username: member.username});
  }

  useEffect(() => {
    const memberRef = ref(db, "members/" + data.chatID);
    const memberAddedListener = onChildAdded(memberRef, (snap) => {
      dispatch({type: "ADD_MEMBER", payload: { uid: snap.key, isOnline: snap.val().isOnline, hasBeenRemoved: snap.val().hasBeenRemoved || false, username: snap.val().username }});
    });

    const memberChangedListener = onChildChanged(memberRef, (snap) => {

      dispatch({type: "CHANGE_MEMBER", payload: { uid: snap.key, isOnline: snap.val().isOnline, hasBeenRemoved: snap.val().hasBeenRemoved || false, username: snap.val().username }});
    })

    return () => {
      memberAddedListener();
      memberChangedListener();
    }

  }, [data.chatID]);
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