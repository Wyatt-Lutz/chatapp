import useChatContexts from "../../../../hooks/useContexts";

const Member = ({ memberUid, memberData }) => {
  const { chatState } = useChatContexts();

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
