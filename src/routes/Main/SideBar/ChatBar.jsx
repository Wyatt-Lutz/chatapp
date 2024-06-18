import { useContext, useState, useEffect, useRef, Fragment, useCallback } from "react";
import Plus from "../../../svg/Plus";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../AuthProvider";
import { db } from "../../../../firebase";
import { ref, query, set, get, orderByChild, equalTo, onChildAdded, update, onChildChanged, onChildRemoved, push } from 'firebase/database';
import { ChatContext } from "../../../ChatProvider";
const ChatBar = () => {

  const { data, dispatch } = useContext(ChatContext);
  const [isAddUser, setAddUser] = useState(false);
  const {register, handleSubmit, resetField} = useForm();
  const { currUser } = useContext(AuthContext);
  const [addUserUsers, setAddUserUsers] = useState([{uid: currUser.uid, username: currUser.displayName}]); //excluded uid of currUser
  const [chats, setChats] = useState([]);
  const [numUnread, setNumUnread] = useState({});
  const chatsInRef = ref(db, "users/" + currUser.uid + '/chatsIn');

  const handleNewChatAdded = useCallback(async(snap) => {
    const newChatID = snap.key;
    const chatRef = ref(db, "chats/" + newChatID);
    const newChatSnap = await get(chatRef);
    const newChatData = newChatSnap.val();

    /*
    if (newChatData.metadata.title === "") {
      newChatData.metadata.title = addUserUsers.map(user => user.username).filter(username => username !== currUser.displayName).join(', ')
    }
*/
    newChatData.id = newChatID;
    setChats(prev => [...prev, newChatData]);
    setNumUnread(prev => ({
      ...prev,
      [newChatID]: snap.val(),
    }));
  }, [currUser]);

  const handleChangeInChat = (snap) => {
    setNumUnread(prev => ({
      ...prev,
      [snap.key]: snap.val(),
    }));
  };


  const handleChildRemoved = (snap) => {
    chats.filter(chat => chat.id !== snap.key);
  };


  useEffect(() => {
    console.info('use effect run');

    const childAddedListener = onChildAdded(chatsInRef, handleNewChatAdded);
    const childChangedListener = onChildChanged(chatsInRef, handleChangeInChat);
    const childRemovedListener = onChildRemoved(chatsInRef, handleChildRemoved);


    return () => {
      childAddedListener();
      childChangedListener();
      childRemovedListener();
    }
  }, [currUser]);



  const addUser = async ({recipient}) => {
    try {
      resetField('recipient');
      console.log(recipient);
      const usersQuery = query(ref(db, "users"), orderByChild('username'), equalTo(recipient));
      get(usersQuery).then((snap) => {
        if (!snap.exists()) {
          console.info('user doesnt exist');
          return;
        }

        if (addUserUsers.some(user => user.username === recipient)) {
          console.info('user already added') //toast
          return;
        }
        const user = {
          uid: Object.keys(snap.val())[0],
          username: Object.values(snap.val())[0].username,
        }
        console.log(user);


        setAddUserUsers(prev => [...prev, user])
        console.info('added user to chatbar');
      })



    } catch (error) {
      console.error(error);
    }
  }

  const createChat = async ({chatName}) => {
    try {
      resetField('chatName');
      const uids = [...addUserUsers.map(user => user.uid)];
      console.log(addUserUsers);

      const chatID = currUser.uid;
      if (chats.some(chat => chat.chatID === chatID)) {
        console.log('already chat with those users') //toast
        return;
      }

      const chatRoomRef = ref(db, "chats/" + chatID);


      set(chatRoomRef, {
        metadata: {
          title: chatName && chatName.length > 0 ? chatName : "",
        },
        lastMessage: "",
        timestamp: 0,
      });

      const membersRef = ref(db, "members/" + chatID);
      const membersList = addUserUsers.reduce((acc, obj) => {
        acc[obj.uid] = {isOnline: false, username: obj.username};
        return acc
      }, {});
      console.log(membersList);
      set(membersRef, membersList);


      uids.forEach((uid) => {
        const userChatDataRef = ref(db, "users/" + uid + "/chatsIn");
        const chatData = {[chatID]: 0};
        update(userChatDataRef, chatData)
      });


      console.info('created chat');
      // see if I can automaitcally go to the chat just created
    } catch (error) {
      console.error(error);
    }
    setAddUser(false);
    setAddUserUsers([{uid: currUser.uid, username: currUser.displayName}]);
  }

  const handleChangeChat = (chatID, title) => {
    dispatch({ type: "CHANGE_CHAT", payload: { chatID, title }});
  };



  return(
    <section>

      <button className="m-2 ring"onClick={() => setAddUser(true)}><Plus /></button>
      {isAddUser && (
        <div className=" inset-0 fixed ">

            <form className="flex" onSubmit={handleSubmit(addUser)}>
              <input {...register('recipient', { required: false })} />
              <div className="flex">
                {addUserUsers.filter(user => user.username !== currUser.displayName).map((user) => (
                  <div className="px-2" key={user.uid}>{user.username}</div>
                ))}
              </div>
              <button className="ring "type="submit">Find User</button>
            </form>

            <form onSubmit={handleSubmit(createChat)}>
              {addUserUsers.length > 1 && (
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
        {chats.map((chat) => (
          <div key={chat.id}>
            <div className="flex">
              <button className="ring m-2" onClick={() => handleChangeChat(chat.id, chat.metadata.title)}>
                {(data.chatID === chat.id && data.title) ? data.title : chat.metadata.title}
              </button>
              <div>{numUnread[chat.id]}</div>

            </div>


          </div>




        ))}

      </div>



    </section>

  )
}
export default ChatBar;