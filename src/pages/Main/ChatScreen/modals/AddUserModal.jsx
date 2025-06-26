import { useState } from "react";
import { db } from "../../../../../firebase";
import { useChatContexts } from "../../../../hooks/useContexts";
import { addUserToChat } from "../../../../services/memberDataService";
import { addMessage } from "../../../../services/messageDataService";

import UserSearch from "../../../../components/UserSearch";
import CloseModal from "../../../../components/ui/CloseModal";
import { useEffect } from "react";
import { useAuth } from "../../../../context/providers/AuthContext";

const AddUserModal = ({ setIsDisplayAddUser }) => {
  const { chatState, memberState } = useChatContexts();
  const [addedUsers, setAddedUsers] = useState([]);
  const [previousUsers, setPreviousUsers] = useState([]);
  const { currUser } = useAuth();

  useEffect(() => {
    const currMemberData = [...memberState.members.entries()].reduce(
      (acc, [uid, data]) => {
        const shouldIncludeUser =
          (!data.isRemoved || (data.isRemoved && data.isBanned)) && // keep users who are not removed but not banned or banned (which means they have been removed)
          uid !== currUser.uid;

        if (shouldIncludeUser) {
          acc.push({ uid, ...data });
        }
        return acc;
      },
      [],
    );

    setPreviousUsers(currMemberData);
  }, [memberState.members, currUser.uid]);

  const onFinishAddingUsers = async () => {
    if (addedUsers.length === 0) {
      return; //toast
    }
    setIsDisplayAddUser(null);
    addedUsers.forEach(async (user) => {
      console.log(user);
      await addUserToChat(db, user, chatState);
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
      memberState.members,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button
          onClick={() => setIsDisplayAddUser(false)}
          className="absolute top-4 right-4"
        >
          <CloseModal />
        </button>
        <h2 className="mb-4 text-lg font-semibold">Add User</h2>

        <p>Enter username:</p>
        <UserSearch
          addedUsers={addedUsers}
          setAddedUsers={setAddedUsers}
          previousUsers={previousUsers}
        />

        <div className="flex justify-end space-x-2">
          <button
            disabled={addedUsers.length === 0}
            onClick={onFinishAddingUsers}
          >
            Finish
          </button>
          <button
            onClick={() => setIsDisplayAddUser(false)}
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
