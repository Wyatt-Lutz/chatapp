
import { useContext, useState, useEffect, useRef, memo, Fragment, useCallback } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../../AuthProvider";
import { db } from "../../../../../firebase";
import { ChatContext } from "../../../../ChatProvider";
import { checkIfDuplicateChat, createChat } from "../../../../services/chatBarDataService";
import { checkIfUserExists } from "../../../../services/globalDatService";
import Close from "../../../../styling-components/Close";
import { getBlockData } from "../../../../services/memberDataService";


const ChatCreation = ({changeChatRoomCreationState}) => {
  console.log('chat creation')
  const { data, dispatch } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);
  const [usersAdded, setUsersAdded] = useState([{uid: currUser.uid, username: currUser.displayName}]);
  const [isUserBlockedWarning, setIsUserBlockedWarning] = useState(null);
  const {register, handleSubmit, resetField} = useForm();


  const addUser = async ({newUser}) => {
    try {
      resetField('newUser');
      if (usersAdded.some(user => user.username === newUser)) {
        console.info('user already added') //toast
        return;
      }
      const userData = await checkIfUserExists(db, newUser);
      if (!userData) {
        console.log('user doenst exist');
        return;
      }

      const user = {
        uid: Object.keys(userData)[0],
        username: Object.values(userData)[0].username,
      }
      console.log(user);


      await checkUsersBlockedStatus(currUser.uid, user);
      console.info('added user to chatbar');

    } catch (error) {
      console.error(error);
    }
  }

  const checkUsersBlockedStatus = async(currUserUid, addedUser) => {
    const currUserBlockData = await getBlockData(db, currUserUid);
    const addedUserBlockData = await getBlockData(db, addedUser.uid);
    if ((addedUserBlockData[currUserUid] || false)) {
      console.log('The user you are adding has blocked you. You cannot add them to a group chat');
      return;
    }
    if ((currUserBlockData[addedUser.uid] || false)) {
      setIsUserBlockedWarning(addedUser);
      return;
    }
    setUsersAdded(prev => [...prev, addedUser]);
  }


  const handleCreateChat = async ({chatName}) => {
    resetField('chatName');

    const uids = [...usersAdded.map(user => user.uid)];
    const memberUids = uids.sort().join("");

    const isDuplicate = await checkIfDuplicateChat(db, currUser.uid, memberUids);
    if (isDuplicate) {
      console.log("chat with those members already exists");
      return;
    }

    const title = chatName && chatName.length > 0 ? chatName : "";

    const membersList = usersAdded.reduce((members, member) => {
      members[member.uid] = {isOnline: false, username: member.username};
      return members
    }, {});


    const newChatID = await createChat(db, memberUids, title, membersList, uids, currUser.uid);
    console.log(newChatID);
    setUsersAdded([{uid: currUser.uid, username: currUser.displayName}]);
    changeChatRoomCreationState(false);
    const ownerUid = currUser.uid;
    dispatch({ type: "CHANGE_CHAT", payload: { newChatID, title, ownerUid }});
  }







  return (
    <>
        <div className="z-100 fixed inset-0 flex items-center justify-center p-6 bg-black bg-opacity-50">
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
                  <button className="ring "type="submit">Find User</button>
                </form>

                <form onSubmit={handleSubmit((data) => handleCreateChat(data))}>
                  {usersAdded.length > 1 && (
                    <div>
                      <div>Create a name for your group (if you want)</div>
                      <input {...register('chatName', { required: false, maxLength: 25})}></input>
                    </div>
                  )}
                  <div className="flex">
                    <button type="submit" className="ring">Create Chat</button>
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
export default memo(ChatCreation);