import { useContext, memo } from "react";
import { ChatContext } from "../../../../ChatProvider";
import { AuthContext } from "../../../../AuthProvider";
import { blockUser, removeUserFromChat } from "../../../../services/memberDataService";
import { db } from "../../../../../firebase";


const MemberContextMenu = ({contextMenuData, points, clientUserIsOwner}) => {
  const { data, dispatch } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);
  console.log('membercontextmenu run');
  return (
    <>
      {contextMenuData.uid !== currUser.uid && (
        <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points?.y, left: points?.x}}>

          <button onClick={() => blockUser(db, currUser.uid, contextMenuData.uid)}>Block User</button>
          {clientUserIsOwner && (
            <button onClick={() => removeUserFromChat(db, data.chatID, contextMenuData.uid, contextMenuData.username, currUser.uid, dispatch)}>Remove User</button>
          )}

        </div>
      )}
    </>


  )
}
export default memo(MemberContextMenu);