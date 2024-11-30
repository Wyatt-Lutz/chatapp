import { memo, useContext } from "react"
import { removeUserFromChat } from "../../../../services/memberDataService";
import { db } from "../../../../../firebase";
import { ChatContext } from "../../../../providers/ChatProvider";
import { AuthContext } from "../../../../providers/AuthProvider";
const ChatRoomContextMenu = ({contextMenuData, points}) => {
  console.log('chatroom context menu')
  const { data, dispatch } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);
  return (
    <div className="fixed bg-gray-500 border border-gray-600 shadow p-2 flex flex-col" style={{top: points?.y, left: points?.x}}>
      <button onClick={() => removeUserFromChat(db, contextMenuData.chatID, currUser.uid, currUser.displayName, currUser.uid, dispatch)}>Leave Group Chat</button>
    </div>
  )
}
export default memo(ChatRoomContextMenu);