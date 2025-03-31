
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../../context/providers/AuthContext";
import { db } from "../../../../../firebase";
import { checkIfDuplicateChat, createChat } from "../../../../services/chatBarDataService";
import { checkIfUserExists } from "../../../../services/globalDatService";
import Close from "../../../../components/ui/Close";
import { getBlockData } from "../../../../services/memberDataService";
import { fetchProfilePicture } from "../../../../services/storageDataService";
import { useChatContexts, useResetChatContexts } from "../../../../hooks/useContexts";
import { updateTempTitle } from "../../../../utils/chatroomUtils";



const ChatCreation = ({changeChatRoomCreationState}) => {
  const { currUser } = useAuth();
  const { chatDispatch, memberDispatch, messageDispatch } = useChatContexts();
  const [usersAdded, setUsersAdded] = useState([{uid: currUser.uid, username: currUser.displayName}]);
  const [isUserBlockedWarning, setIsUserBlockedWarning] = useState(null);
  const {register, handleSubmit, resetField} = useForm();
  const resetContexts = useResetChatContexts();

  const addUser = async ({newUser}) => {
    resetField('newUser');
    if (usersAdded.some(user => user.username === newUser)) {
      console.info('user already added') //toast
      return;
    }
    const userData = await checkIfUserExists(db, newUser);
    if (!userData) {
      console.log("user doesn't exist");
      return;
    }

    const user = {
      uid: Object.keys(userData)[0],
      username: Object.values(userData)[0].username,
    }
    console.log(user);


    await checkUsersBlockedStatus(currUser.uid, user);
    console.info('added user to chatbar');


  }

  const checkUsersBlockedStatus = async(currUserUid, addedUser) => {
    const [currUserBlockData, addedUserBlockData] = await Promise.all([
      getBlockData(db, currUserUid),
      getBlockData(db, addedUser.uid),
    ]);

    if (addedUserBlockData[currUserUid]) {
      console.log('The user you are adding has blocked you. You cannot add them to a group chat');
      return;
    }
    if (currUserBlockData[addedUser.uid]) {
      setIsUserBlockedWarning(addedUser);
      return;
    }
    setUsersAdded(prev => [...prev, addedUser]);
  }


  const handleCreateChat = async ({chatName}) => {
    if (usersAdded.length < 2) return;
    resetField('chatName');

    const uids = [...usersAdded.map(user => user.uid)];
    const memberUids = uids.sort().join("");
    let title, tempTitle;
    title = tempTitle = "";

    const isDuplicate = await checkIfDuplicateChat(db, currUser.uid, memberUids);
    if (isDuplicate) {
      console.log("chat with those members already exists");
      return;
    }
    const membersList = {};

    for (const member of usersAdded) {
      const profilePicture = await fetchProfilePicture(member.uid);
      membersList[member.uid] = { isOnline: false, username: member.username, hasBeenRemoved: false, profilePictureURL: profilePicture };
    }

    console.log(membersList);

    //if the user entered a title, use it, if not, take the members list and map them out to use as the title
    if (chatName && chatName.length > 0) {
      title = chatName;
    } else {
      tempTitle = Object.values(membersList).map(member => member.username).join(', ');
    }


    const newChatID = await createChat(db, memberUids, title, tempTitle, membersList, uids, usersAdded.length, currUser.uid);
    //setUsersAdded([{uid: currUser.uid, username: currUser.displayName}]);
    changeChatRoomCreationState(false);
    const updatedTempTitle = updateTempTitle(tempTitle, currUser.displayName);

    resetContexts();
    chatDispatch({ type: "CHANGE_CHAT", payload: { chatID: newChatID, title, owner: currUser.uid, tempTitle: updatedTempTitle, numOfMembers: usersAdded.length, firstMessageID: "" }});
  }



  return (
    <>
        <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/50">
          <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
            <button onClick={() => changeChatRoomCreationState(false)} className="absolute top-4 right-4"><Close /></button>
            {isUserBlockedWarning ? (
              <div>
                <h2 className="mb-4 text-lg font-semibold">Blocked User</h2>
                <p>The user you are trying to add has been blocked. Are you sure you want to add them?</p>
                <div>
                  <button className="border rounded-md bg-zinc-500 m-2 p-1" onClick={() => {setUsersAdded((prev) => [...prev, isUserBlockedWarning]); setIsUserBlockedWarning(null)}}>Yes</button>
                  <button className="border rounded-md bg-zinc-500 m-2 p-1" onClick={() => {setIsUserBlockedWarning(null)}}>No</button>
                </div>
              </div>
            ) : (
              <div className="">
                <form className="flex" onSubmit={handleSubmit(addUser)}>
                  <input {...register('newUser', { required: false })} />
                  <div className="flex">
                    {usersAdded && usersAdded.filter(user => user.username !== currUser.displayName).map((user) => (
                      <div className="px-2" key={user.uid}>{user.username}</div>
                    ))}
                  </div>
                  <button className="ring"type="submit">Find User</button>
                </form>

                <form onSubmit={handleSubmit((data) => handleCreateChat(data))}>
                  {usersAdded.length > 2 && (
                    <div>
                      <div>Create a name for your group (optional)</div>
                      <input {...register('chatName', { required: false, maxLength: 25})}></input>
                    </div>
                  )}
                  <div className="flex">
                    <button type="submit" disabled={usersAdded.length < 2} className="ring">Create Chat</button>
                    <button className="ring" onClick={() => changeChatRoomCreationState(false)}>Cancel</button>
                  </div>


                </form>
              </div>

            )}



          </div>
        </div>



    </>


  )
}
export default ChatCreation;
