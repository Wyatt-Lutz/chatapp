import { useState } from "react";
import { useAuth } from "../../../../../context/providers/AuthContext";
import { db } from "../../../../../../firebase";
import {
  checkIfDuplicateChat,
  createChat,
} from "../../../../../services/chatBarDataService";
import { useChatContexts } from "../../../../../hooks/useContexts";
import { updateTempTitle } from "../../../../../utils/chatroomUtils";

import UserSearch from "../../../../../components/UserSearch";
import CloseModal from "../../../../../components/ui/CloseModal";

const ChatCreationModal = ({ changeChatRoomCreationState }) => {
  const { currUser } = useAuth();
  const { chatroomsState, chatDispatch, resetAllChatContexts } =
    useChatContexts();
  const [addedUsers, setAddedUsers] = useState([]);
  const [chatTitleInputText, setChatTitleInputText] = useState("");

  const handleCreateChat = async () => {
    if (addedUsers.length === 0) return;

    const { uid, displayName, photoURL } = currUser;

    const usersToAdd = [
      ...addedUsers,
      { uid, username: displayName, profilePictureURL: photoURL }, //This is the client users data
    ];

    const uids = usersToAdd.map((user) => user.uid);
    const memberUids = uids.sort().join("");

    //Check if there is an existing chatroom with duplicate members
    if (checkIfDuplicateChat(memberUids, chatroomsState.chatrooms)) {
      console.log("chat with those members already exists"); //popup
      return;
    }

    const membersList = usersToAdd.reduce((acc, member) => {
      acc[member.uid] = {
        isOnline: false,
        username: member.username,
        isRemoved: false,
        isBanned: false,
        profilePictureURL: member.profilePictureURL,
      };
      return acc;
    }, {});

    const title = chatTitleInputText?.trim() || "";
    const tempTitle = Object.values(membersList)
      .map((member) => member.username)
      .join(", ");

    setChatTitleInputText("");

    const newChatID = await createChat(
      db,
      memberUids,
      title,
      tempTitle,
      membersList,
      uids,
      usersToAdd.length,
      uid,
    );
    changeChatRoomCreationState(false);
    const updatedTempTitle = updateTempTitle(tempTitle, displayName);

    resetAllChatContexts();
    chatDispatch({
      type: "CHANGE_CHAT",
      payload: {
        chatID: newChatID,
        title,
        owner: uid,
        tempTitle: updatedTempTitle,
        numOfMembers: usersToAdd.length,
        firstMessageID: "",
        memberUids: memberUids,
      },
    });
  };

  return (
    <>
      <div className="fixed z-50 inset-0 flex items-center justify-center p-6 bg-black/50">
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
