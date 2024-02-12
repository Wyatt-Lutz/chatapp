import { useContext, useState, useEffect } from "react";
import Plus from "../../../svg/Plus";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../AuthProvider";

import {collection, getDocs, getDoc, setDoc, updateDoc, doc, query} from 'firebase/firestore';
import { db } from "../../../../firebase";
import { ChatContext } from "../../../ChatProvider";
const ChatBar = () => {


  const { dispatch } = useContext(ChatContext);
  const [isAddUser, setAddUser] = useState(false);
  const {register, handleSubmit} = useForm();
  const { currUser } = useContext(AuthContext);
  const [addUserUsers, setAddUserUsers] = useState([]); //excluded uid of currUser
  const [chats, setChats] = useState([]);



  const docRef = collection(db, 'users');

  useEffect(() => {

    const getChats = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users", currUser.uid, "userChats"));
        const fetchedChats  = querySnapshot.docs.map((doc) => {
          return{
            chatID: doc.data().chatID,
            chatName: doc.data().chatName,
            recipients: doc.data().recipients,
          }
        })
        setChats(fetchedChats);







      } catch (error) {
        console.error(error);
      }
    }
    getChats();
  }, [chats]);


  const addUser = async ({recipient}) => {
    try {
      console.log(addUserUsers);

      const snap = await getDocs(docRef);
      const recipientUser = snap.docs.find((doc) => doc.data().username === recipient);

      if (!recipientUser) {
        console.info('user does not exist') //toast
        return;
      }
      if (addUserUsers.some(user => user === recipientUser)) {
        console.info('user already added') //toast
        return;
      }
      setAddUserUsers(prev => [...prev, recipientUser])

    } catch (error) {
      console.error(error);
    }
  }

  const createChat = async ({chatName}) => {
    try {

      const uids = [currUser.uid];
      addUserUsers.forEach((user) => uids.push(user.data().uid));
      const recipients = [];

      addUserUsers.forEach((user) => recipients.push(user.data().username));
      function sortUids(a, b) {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      }
      uids.sort(sortUids);
      console.log(uids);
      const chatID = uids.join("");
      console.log(chatID);


      await setDoc(doc(db, "chats", chatID), {
        name: chatName ?? "",
        chatID: chatID,
        messages: {
          text: "",

        },
      });


      for(let i=0; i < uids.length; i++) {
        await setDoc(doc(db, "users", uids[i], "userChats", chatID), {
          chatID: chatID,
          chatName: chatName ?? "",
          recipients: recipients,
          //add chat picture
        });

      }

      setAddUser(false);
      // see if I can automaitcally go to the chat just created

    } catch (error) {
      console.error(error);
    }




  }

  const handleChangeChat = (chatID) => {
    dispatch({ type: "CHANGE_CHAT", payload: chatID});
  };



  return(
    <section>

      <button className="m-2 ring"onClick={() => setAddUser(true)}><Plus /></button>
      {isAddUser && (
        <div className=" inset-0 fixed ">

            <form onSubmit={handleSubmit(addUser)}>
              <input {...register('recipient', { required: true })}></input>
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
      <div>hello</div>
      {chats && chats.map((chat) => (
        <button className="ring m-2" onClick={() => handleChangeChat(chat.chatID)} key={chat.chatID}>
          {chat.chatName !== "" ? (
            <div>{chat.chatName}</div>
          ) : (
            <div>{chat.recipients.join(", ")}</div> // add ... at limit of last name
          )}

        </button>

      ))}


    </section>

  )
}
export default ChatBar;