import { lazy } from "react";
import { useChatContexts } from "../../../../hooks/useContexts";

const Crown = lazy(() => import("../../../../components/ui/Crown"));

const Member = ({ memberUid, memberData }) => {
  const { chatState } = useChatContexts();

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-500 rounded-md shadow-sm hover:bg-gray-600 transition-colors">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img
            className="h-full w-full object-cover"
            src={memberData?.profilePictureURL}
          />
        </div>
        <div className="text-gray-800 font-medium">{memberData?.username}</div>
      </div>
      {chatState.owner === memberUid && (
        <div className="ml-2">
          <Crown />
        </div>
      )}
    </div>
  );
};
export default Member;
