import { memo, useContext } from "react"
import { ChatContext } from "../../../../ChatProvider"

const Member = ({ member }) => {
  console.log('member run')
  const { data } = useContext(ChatContext);

  const fetchProfilePicture = () => {

  }
  
  return (
    <div className="flex">
      <div>{member.username}</div>

      {data.owner === member.uid && (
        <div>Owner</div>
      )}
    </div>

  )
}
export default memo(Member);