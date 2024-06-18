import { useContext, memo } from "react";
import { ChatContext } from "../../../../ChatProvider";
import { AuthContext } from "../../../../AuthProvider";
import { blockUser, removeUserFromChat } from "./useMemberData";
const MemberContextMenu = ({contextMenuData, points}) => {
  const { data } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);

  return (
    <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points?.y, left: points?.x}}>
      <button onClick={() => blockUser()}>Block User</button>
      {currUser.uid === data.chatID && (
        <button onClick={() => removeUserFromChat()}>Remove User</button>
      )}

    </div>
  )
}
export default memo(MemberContextMenu);