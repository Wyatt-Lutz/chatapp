import { useState } from "react";
import { useAuth } from "../../../../../context/providers/AuthContext";
import { db } from "../../../../../../firebase";
import {
  checkIfDuplicateChat,
  createChat,
} from "../../../../../services/chatBarDataService";
import { getBlockData } from "../../../../../services/memberDataService";
import { fetchProfilePicture } from "../../../../../services/storageDataService";
import { useChatContexts } from "../../../../../hooks/useContexts";
import { updateTempTitle } from "../../../../../utils/chatroomUtils";
import CloseModal from "../../../../../components/ui/CloseModal";
import UserSearch from "../../../../../components/UserSearch";
import { fetchUserData } from "../../../../../services/globalDataService";

const ChatCreationModal = ({ changeChatRoomCreationState }) => {
  const { currUser } = useAuth();
  const { chatroomsState, chatDispatch, resetAllChatContexts } =
    useChatContexts();
  const [addedUsers, setAddedUsers] = useState([]);
  const [chatTitleInputText, setChatTitleInputText] = useState("");

  const handleCreateChat = async () => {
    console.log("run");
    if (addedUsers.length === 0) return;

    const currUserUid = currUser.uid;
    const currUserData = await fetchUserData(db, currUserUid);
    const transformedCurrUserData = { userUid: currUserUid, ...currUserData };

    const usersToAdd = [...addedUsers, transformedCurrUserData];
    console.log(usersToAdd);

    const uids = usersToAdd.map((user) => user.userUid);
    const memberUids = uids.sort().join("");
    let title, tempTitle;
    title = tempTitle = "";

    const isDuplicate = checkIfDuplicateChat(
      memberUids,
      chatroomsState.chatrooms,
    );
    if (isDuplicate) {
      console.log("chat with those members already exists");
      return;
    }
    const membersList = {};

    for (const member of usersToAdd) {
      membersList[member.userUid] = {
        isOnline: false,
        username: member.username,
        hasBeenRemoved: false,
        profilePictureURL: member.profilePictureURL,
      };
    }

    console.log(membersList);

    //if the user entered a title, use it, if not, take the members list and map them out to use as the title
    if (chatTitleInputText && chatTitleInputText.length > 0) {
      title = chatTitleInputText;
    } else {
      tempTitle = Object.values(membersList)
        .map((member) => member.username)
        .join(", ");
    }
    setChatTitleInputText("");

    const newChatID = await createChat(
      db,
      memberUids,
      title,
      tempTitle,
      membersList,
      uids,
      usersToAdd.length,
      currUserUid,
    );
    console.log(newChatID);
    changeChatRoomCreationState(false);
    const updatedTempTitle = updateTempTitle(tempTitle, currUser.displayName);

    resetAllChatContexts();
    chatDispatch({
      type: "CHANGE_CHAT",
      payload: {
        chatID: newChatID,
        title,
        owner: currUserUid,
        tempTitle: updatedTempTitle,
        numOfMembers: usersToAdd.length,
        firstMessageID: "",
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/50">
        <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
          <button
            onClick={() => changeChatRoomCreationState(false)}
            className="absolute top-4 right-4"
          >
            <CloseModal />
          </button>
          <div>
            <UserSearch addedUsers={addedUsers} setAddedUsers={setAddedUsers} />

            {addedUsers.length > 2 && (
              <div>
                <div>Create a name for your group (optional)</div>
                <input
                  maxLength={25}
                  onChange={(e) => setChatTitleInputText(e.target.value)}
                  value={chatTitleInputText}
                />
              </div>
            )}
            <div className="flex">
              <button
                onClick={handleCreateChat}
                type="submit"
                disabled={addedUsers.length < 1}
                className="ring"
              >
                Create Chat
              </button>
              <button
                className="ring"
                onClick={() => changeChatRoomCreationState(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ChatCreationModal;
