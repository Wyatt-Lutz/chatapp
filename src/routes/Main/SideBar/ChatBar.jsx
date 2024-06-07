import { useContext, useState, useEffect, useRef, useCallback } from "react";
import Plus from "../../../svg/Plus";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../AuthProvider";
import { db } from "../../../../firebase";
import { ref, query, set, get, push, orderByChild, equalTo, onChildAdded, update, onChildChanged } from 'firebase/database'
import { ChatContext } from "../../../ChatProvider";
const ChatBar = () => {


  const { dispatch } = useContext(ChatContext);
  const [isAddUser, setAddUser] = useState(false);
  const {register, handleSubmit, resetField} = useForm();
  const { currUser } = useContext(AuthContext);
  const [addUserUsers, setAddUserUsers] = useState([]); //excluded uid of currUser
  const [chats, setChats] = useState([]);
  const chatsInRef = ref(db, "users/" + currUser.uid + '/chatsIn');

  const handleNewChatAdded = useCallback(async(snap) => {
    const newChatID = snap.key;
    const chatRef = ref(db, "chats/" + newChatID);
    console.log(newChatID)
    const newChatSnap = await get(chatRef);
    const newChatData = newChatSnap.val();
    newChatData.id = newChatID;
    setChats(prev => [...prev, newChatData]);

  }, [currUser]);



  useEffect(() => {
    console.info('use effect run')


    const childAddedListener = onChildAdded(chatsInRef, handleNewChatAdded);
    const childChangedListener = onChildChanged(chatsIn)
    //const childChangedListener = onChildChanged()
    return () => {
      childAddedListener();
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


      const uids = [currUser.uid, ...addUserUsers.map(user => user.uid)];


      console.log(Object.values(addUserUsers));

/*
      uids.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      });
  */


      const chatID = uids.sort().join("");
      if (chats.some(chat => chat.chatID === chatID)) {
        console.log('already chat with those users') //toast
        return;
      }


      set(ref(db, "chats/" + chatID), {
        title: chatName && chatName.length > 0 ? chatName : addUserUsers.map(user => user.username).join(", "),
        lastMessage: null,
        timeStamp: null,
      });



      uids.forEach((uid) => {
        const userChatDataRef = ref(db, "users/" + uid + "/chatsIn");
        const chatData = {[chatID]: 0};
        //push(userChatDataRef, chatData);
        update(userChatDataRef, chatData)

        const membersDataRef = ref(db, "chats/" + chatID);
        const userData = {[uid]: false};
        //push(membersDataRef, userData);
        update(membersDataRef, userData);
      })


      console.info('created chat');
      // see if I can automaitcally go to the chat just created
    } catch (error) {
      console.error(error);
    }
    setAddUser(false);
    setAddUserUsers([]);
  }

  const handleChangeChat = (chatID) => {
    dispatch({ type: "CHANGE_CHAT", payload: chatID});
  };



  return(
    <section>

      <button className="m-2 ring"onClick={() => setAddUser(true)}><Plus /></button>
      {isAddUser && (
        <div className=" inset-0 fixed ">

            <form className="flex" onSubmit={handleSubmit(addUser)}>
              <input {...register('recipient', { required: false })} />
              <div className="flex">
                {addUserUsers.map((user) => (
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

          <button className="ring m-2" onClick={() => handleChangeChat(chat.id)} key={chat.id}>
            {chat.title.split(', ').filter(username => username !== currUser.displayName).join(', ')}
            {chat.lastMessage && chat.lastMessage}
            {chat.timeStamp && chat.timeStamp}

          </button>




        ))}

      </div>



    </section>

  )
}
export default ChatBar;