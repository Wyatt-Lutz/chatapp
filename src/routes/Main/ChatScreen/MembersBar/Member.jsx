import { memo, useContext } from "react"
import { ChatContext } from "../../../../providers/ChatContext";

const Member = ({ memberUid, memberData }) => {
  console.log('member run')
  const { currChat } = useContext(ChatContext);
  console.log(memberData);


  /*
  const fetchProfilePicture = () => {

  }
  */

  return (
    <div className="flex">
      <div>{memberData?.username}</div>

      {currChat.chatData.owner === memberUid && (
        <div>Owner</div>
      )}
    </div>

  )
}
export default Member;