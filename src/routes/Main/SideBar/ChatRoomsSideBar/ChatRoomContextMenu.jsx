import { memo, useContext } from "react"
import { removeUserFromChat } from "../../../../services/memberDataService";
import { db } from "../../../../../firebase";
import { AuthContext } from "../../../../providers/AuthProvider";
const ChatRoomContextMenu = ({chatRoomID, points}) => {
  console.log('chatroom context menu')
  const { currUser } = useContext(AuthContext);

  const onRemoveUserFromChat = async() => {
    await removeUserFromChat(db, chatRoomID, currUser.uid, currUser.displayName, currUser.uid);
  }

  return (
    <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points?.y, left: points?.x}}>
      <button onClick={onRemoveUserFromChat}>Leave Group Chat</button>
    </div>
  )
}
export default memo(ChatRoomContextMenu);