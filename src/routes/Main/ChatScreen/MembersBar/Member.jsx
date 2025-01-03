import { memo, useContext } from "react"
import { ChatContext } from "../../../../providers/ChatContext";

const Member = ({ memberUid, memberData }) => {
  console.log('member run');
  const { chatState } = useContext(ChatContext);

  /*
  const fetchProfilePicture = () => {

  }
  */

  return (
    <div className="flex">
      <div>{memberData?.username}</div>

      {chatState.owner === memberUid && (
        <div>Owner</div>
      )}
    </div>

  )
}
export default Member;