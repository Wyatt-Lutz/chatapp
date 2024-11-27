import { memo, useContext, useEffect, useRef, useState } from "react"
import Member from "./Member";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import MemberContextMenu from "./MemberContextMenu";
import { ChatContext } from "../../../../ChatProvider";
import { AuthContext } from "../../../../AuthProvider";
import { onChildAdded, onChildChanged, ref } from "firebase/database";
import { db } from "../../../../../firebase";
import { getBlockData } from "../../../../services/memberDataService";
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
    setContextMenuData({member: member});
  }




  useEffect(() => {
    let memberAddedListener, memberChangedListener;
    const getBlockedData = async() => {
      const data = await getBlockData(db, currUser.uid);
      return data;
    }

    const setMemberData = async() => {
      const blockData = await getBlockedData();
      console.log(blockData);
      const memberRef = ref(db, "members/" + data.chatID);
      memberAddedListener = onChildAdded(memberRef, (snap) => {
        dispatch({type: "ADD_MEMBER", payload: { uid: snap.key, isOnline: snap.val().isOnline, isBlocked: blockData[snap.key] || false, hasBeenRemoved: snap.val().hasBeenRemoved || false, username: snap.val().username }});
      });

      memberChangedListener = onChildChanged(memberRef, (snap) => {
        dispatch({type: "CHANGE_MEMBER", payload: { uid: snap.key, isOnline: snap.val().isOnline, isBlocked: blockData[snap.key] || false, hasBeenRemoved: snap.val().hasBeenRemoved || false, username: snap.val().username }});
      });
    }
    setMemberData();
    return () => {
      if(memberAddedListener) {
        console.log('hello')
        memberAddedListener();
      }
      if (memberChangedListener) {
        memberChangedListener();
      }
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