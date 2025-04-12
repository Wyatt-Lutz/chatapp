import { useState } from "react";
import { db } from "../../../../../firebase";
import UserSearch from "../../../../components/UserSearch";
import { useChatContexts } from "../../../../hooks/useContexts";
import { addUserToChat } from "../../../../services/memberDataService";
import CloseModal from "../../../../components/ui/CloseModal";

const AddUserModal = ({setIsDisplayAddUser}) => {

  const [addedUsers, setAddedUsers] = useState([])

  const { chatState, chatDispatch } = useChatContexts();

  const onFinishAddingUsers = async() => {
    if (addedUsers.length === 0) {
      return; //toast
    }

    addedUsers.forEach(async(user) => {
      console.log(user);
      await addUserToChat(db, chatState.chatID, user.userUid, user.username, user.profilePictureURL, chatState.tempTitle, chatDispatch);
    });

    setIsDisplayAddUser(null);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button onClick={() => setIsDisplayAddUser(null)} className="absolute top-4 right-4"><CloseModal /></button>
        <h2 className="mb-4 text-lg font-semibold">Add User</h2>

        <p>Enter username:</p>
        <UserSearch setAddedUsers={setAddedUsers} />

        {addedUsers && addedUsers.length > 0 && (
          <div>
            {addedUsers.map((user) => (
                <div key={user.userUid}>
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                        <img className="h-full w-full object-cover" src={user.profilePictureURL} />
                    </div>
                    <span>{user.username}</span>
                    <button onClick={() => setAddedUsers((prev) => prev.filter((addedUser) => addedUser.userUid !== user.userUid ))}>
                        <CloseModal />
                    </button>

                </div>
            ))}
          </div>
        )}


        <div className="flex justify-end space-x-2">
          <button disabled={addedUsers.length === 0} onClick={onFinishAddingUsers}>Finish</button>
          <button onClick={() => {setIsDisplayAddUser(null)}} className="px-4 py-2 text-white">Cancel</button>


        </div>

      </div>

    </div>
  )
}
export default AddUserModal;
