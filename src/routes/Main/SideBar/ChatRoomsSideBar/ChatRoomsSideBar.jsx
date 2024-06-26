import { useContext, useState, useEffect, useRef, memo, Fragment, useCallback } from "react";
import Plus from "../../../../styling-components/Plus";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../../AuthProvider";
import { db } from "../../../../../firebase";
import { ref, query, set, get, orderByChild, equalTo, onChildAdded, update, onChildChanged, onChildRemoved, push } from 'firebase/database';
import { ChatContext } from "../../../../ChatProvider";
import { createChat } from "../../../../services/chatBarDataService";
const ChatRoomsSideBar = () => {

  const { data, dispatch } = useContext(ChatContext);
  const { currUser } = useContext(AuthContext);

  const {register, handleSubmit, resetField} = useForm();

  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [usersAdded, setUsersAdded] = useState([{uid: currUser.uid, username: currUser.displayName}]);
  const [chatsData, setChatsData] = useState({
    chats: [],
    numUnread: {},
  });

  const chatsInRef = ref(db, "users/" + currUser.uid + '/chatsIn');



  const handleNewChatAdded = useCallback(async(snap) => {
    const newChatID = snap.key;
    const chatsRef = ref(db, "chats/" + newChatID);
    const newChatSnap = await get(chatsRef);
    const newChatData = newChatSnap.val();


    // If creater of chat didn't set a title, create a title for the client based off the members usernames
    const membersRef = ref(db, "members/" + newChatID);
    const membersSnap = await get(membersRef);
    const membersData = Object.values(membersSnap.val());
    if (newChatData.title === "") {
      newChatData.title = membersData.filter(member => member.username !== currUser.displayName).map(member => member.username).join(', ');
    }

    newChatData.id = newChatID;
    setChatsData(prev => ({
      chats: [...prev.chats, newChatData],
      numUnread: {
        ...prev.numUnread,
        [newChatID]: snap.val(),
      }
    }));
  });

  const handleUpdateUnread = (snap) => {
    setChatsData(prev => ({
      numUnread: {
        ...prev.numUnread,
        [snap.key]: snap.val(),
      }
    }));
  };


  const handleChildRemoved = (snap) => {
    setChatsData(prev => prev.chats.filter(chat => chat.id !== snap.key));
  };


  useEffect(() => {
    const childAddedListener = onChildAdded(chatsInRef, handleNewChatAdded);
    const childChangedListener = onChildChanged(chatsInRef, handleUpdateUnread);
    const childRemovedListener = onChildRemoved(chatsInRef, handleChildRemoved);


    return () => {
      childAddedListener();
      childChangedListener();
      childRemovedListener();
    }
  }, [currUser]);



  const addUser = async ({newUser}) => {
    try {
      resetField('newUser');
      if (usersAdded.some(user => user.username === newUser)) {
        console.info('user already added') //toast
        return;
      }

      const usersQuery = query(ref(db, "users"), orderByChild('username'), equalTo(newUser));
      const usersQuerySnap = await get(usersQuery);
      if (!usersQuerySnap.exists()) {
        console.info('user doesnt exist');
        return;
      }
      const user = {
        uid: Object.keys(usersQuerySnap.val())[0],
        username: Object.values(usersQuerySnap.val())[0].username,
      }

      setUsersAdded(prev => [...prev, user])
      console.info('added user to chatbar');

    } catch (error) {
      console.error(error);
    }
  }





  const handleCreateChat = ({chatName}) => {
    resetField('chatName');
    const uids = [...usersAdded.map(user => user.uid)];
    const chatID = uids.join("");

    const title = chatName && chatName.length > 0 ? chatName : "";

    if (chatsData.chats.some(chat => chat.chatID === chatID)) {
      console.log("chat with those members already exists");
      return;
    }
    const membersList = usersAdded.reduce((members, member) => {
      members[member.uid] = {isOnline: false, username: member.username};
      return members
    }, {});


    createChat(db, chatID, title, membersList, uids, currUser.uid);
    setIsCreatingChat(false);
    setUsersAdded([{uid: currUser.uid, username: currUser.displayName}]);

    handleChangeChat(chatID, title, currUser.uid);
  }

  const handleChangeChat = (chatID, title, owner) => {
    dispatch({ type: "CHANGE_CHAT", payload: { chatID, title, owner }});
  };


  return(
    <section>

      <button className="m-2 ring"onClick={() => setIsCreatingChat(true)}><Plus /></button>
      {isCreatingChat && (
        <div className=" inset-0 fixed ">

            <form className="flex" onSubmit={handleSubmit(addUser)}>
              <input {...register('newUser', { required: false })} />
              <div className="flex">
                {usersAdded.filter(user => user.username !== currUser.displayName).map((user) => (
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
              <button type="submit" className="ring">Create Chat</button>

            </form>
        </div>

      )}

      <div className="flex flex-col">
        {chatsData?.chats?.length > 0 ? (
          chatsData.chats.map((chat) => (
            <div key={chat.id}>
              <div className="flex">
                <button className="ring m-2" onClick={() => handleChangeChat(chat.id, chat.title, chat.owner)}>
                  {(data.chatID === chat.id && data.title) ? data.title : chat.title}
                </button>
                <div>{chatsData.numUnread[chat.id]}</div>

              </div>

            </div>




          ))

        ) : (
          <div>You aren't in any chats</div>
        )}


      </div>



    </section>

  )
}
export default memo(ChatRoomsSideBar);