import { memo } from "react"

const Member = ({ member }) => {
  console.log('member run')

  const fetchProfilePicture = () => {

  }
console.log(Object.keys(member)[0])
  return (
    <div className="flex">
      <div>{Object.values(member)[0].username}</div>

      {Object.values(member)[0].isOwner && (
        <div>Owner</div>
      )}
    </div>

  )
}
export default memo(Member);