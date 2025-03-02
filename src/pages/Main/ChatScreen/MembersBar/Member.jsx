import { useContext } from "react"
import { ChatContext } from "../../../../context/ChatContext";

const Member = ({ memberUid, memberData }) => {
  console.log('member run');
  const { chatState } = useContext(ChatContext);

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