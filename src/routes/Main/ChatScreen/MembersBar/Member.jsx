import { memo, useContext } from "react"
import { ChatContext } from "../../../../providers/ChatContext";

const Member = ({ member }) => {
  console.log('member run')
  const { chatRoomData } = useContext(ChatContext);

  const {memberUid, memberData} = member;
  

  /*
  const fetchProfilePicture = () => {

  }
  */
  
  return (
    <div className="flex">
      <div>{memberData.username}</div>

      {chatRoomData.owner === memberUid && (
        <div>Owner</div>
      )}
    </div>

  )
}
export default memo(Member);