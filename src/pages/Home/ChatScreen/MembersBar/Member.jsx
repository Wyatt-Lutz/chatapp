import { useChatContexts } from "../../../../hooks/useContexts";

import Crown from "../../../../components/ui/Crown";

const Member = ({ memberUid, memberData }) => {
  const { chatState } = useChatContexts();

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-zinc-700/40 rounded-md hover:bg-zinc-700/30 transition">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700">
          <img
            className="h-full w-full object-cover"
            src={memberData?.profilePictureURL}
          />
        </div>
        <div>
          <div className="text-zinc-100 font-medium">
            {memberData?.username}
          </div>
          <div
            className={`text-xs ${memberData?.isOnline ? "text-violet-400 font-medium" : "text-zinc-400"}`}
          >
            {memberData?.isOnline ? "Online" : "Offline"}
          </div>
        </div>
      </div>
      {chatState.owner === memberUid && (
        <div className="ml-2 text-yellow-400">
          <Crown />
        </div>
      )}
    </div>
  );
};
export default Member;
