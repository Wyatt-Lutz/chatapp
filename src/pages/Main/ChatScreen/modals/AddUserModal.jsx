import { useState } from "react";
import { db } from "../../../../../firebase";
import { useChatContexts } from "../../../../hooks/useContexts";
import { addUserToChat } from "../../../../services/memberDataService";
import { addMessage } from "../../../../services/messageDataService";

import UserSearch from "../../../../components/UserSearch";
import CloseModal from "../../../../components/ui/CloseModal";
import { useEffect } from "react";

const AddUserModal = ({ setIsDisplayAddUser }) => {
  const { chatState, chatDispatch, memberState } = useChatContexts();
  const [addedUsers, setAddedUsers] = useState([]);

  useEffect(() => {
    const currMemberData = [...memberState.members.entries()]
      .map(([userUid, userData]) => ({
        userUid,
        ...userData,
      }))
      .filter((member) => !member.hasBeenRemoved);
    setAddedUsers(currMemberData);
  }, []);

  const onFinishAddingUsers = async () => {
    if (addedUsers.length === 0) {
      return; //toast
    }

    addedUsers.forEach(async (user) => {
      console.log(user);
      await addUserToChat(
        db,
        chatState.chatID,
        user.userUid,
        user.username,
        user.profilePictureURL,
        chatState.numOfMembers,
        chatDispatch,
      );
    });
    const userAddedServerMessage =
      addedUsers
        .map((user) => " " + user.username)
        .toString()
        .trim() + " has been added to the chat!";
    console.log(userAddedServerMessage);
    await addMessage(
      userAddedServerMessage,
      chatState.chatID,
      "server",
      db,
      true,
      chatDispatch,
      memberState.members,
    );
    setIsDisplayAddUser(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button
          onClick={() => setIsDisplayAddUser(null)}
          className="absolute top-4 right-4"
        >
          <CloseModal />
        </button>
        <h2 className="mb-4 text-lg font-semibold">Add User</h2>

        <p>Enter username:</p>
        <UserSearch addedUsers={addedUsers} setAddedUsers={setAddedUsers} />

        <div className="flex justify-end space-x-2">
          <button
            disabled={addedUsers.length === 0}
            onClick={onFinishAddingUsers}
          >
            Finish
          </button>
          <button
            onClick={() => {
              setIsDisplayAddUser(null);
            }}
            className="px-4 py-2 text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddUserModal;
