import { useContext, useState, useEffect, useRef } from "react";
import Plus from "../../../svg/Plus";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../AuthProvider";

import {collection, getDocs, getDoc, setDoc, updateDoc, where, doc, query, onSnapshot} from 'firebase/firestore';
import { db } from "../../../../firebase";
import { ChatContext } from "../../../ChatProvider";
const ChatBar = () => {


  const { dispatch } = useContext(ChatContext);
  const [isAddUser, setAddUser] = useState(false);
  const {register, handleSubmit} = useForm();
  const { currUser } = useContext(AuthContext);
  const [addUserUsers, setAddUserUsers] = useState([]); //excluded uid of currUser
  const [chats, setChats] = useState([]);
  const initialMount = useRef(true);


  const docRef = collection(db, 'users');

  const fetchChats = async () => {
    try {
      console.info("chatBar fetched initial chats");
      const chatsQuery = query(collection(db, "chats"), where(`recipients.${currUser.displayName}`, "==", true));
      const querySnapshot = await getDocs(chatsQuery);
      if (querySnapshot.empty) {
        console.info('chatBar querySnapshot empty')
        return;
      }

      const chatsIn = querySnapshot.docs.map((chat) => ({
        name: chat.data().name,
        recipients: chat.data().recipients,
        chatID: chat.data().chatID,
      }));

      setChats(chatsIn);

    } catch (error) {
      console.error(error);
    }

  }





  useEffect(() => {
    if (!currUser) {
      console.info('no current user');
      return;
    }
    fetchChats();
    const chatsQuery = query(collection(db, "chats"),  where(`recipients.${currUser.displayName}`, "==", true));
    const listener = onSnapshot(chatsQuery, (snap) => {
      if(initialMount.current) {
        console.info('subscribed to chatBar listener');
        initialMount.current = false;
        return;
      }
      console.info('Chatbar listener fetch chats');
      const chatsIn = snap.docs.map((doc) => doc.data());
      setChats(chatsIn);

    });
    return () => {
      console.info("unsubscribing from chatBar listner")
      listener();
    }
  }, [currUser]);



  const addUser = async ({recipient}) => {
    try {

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
      console.info('added user to chatbar')
      setAddUserUsers(prev => [...prev, recipientUser])

    } catch (error) {
      console.error(error);
    }
  }

  const createChat = async ({chatName}) => {
    try {

      const uids = [currUser.uid];
      const recipients = {};
      recipients[currUser.displayName] = true;

      addUserUsers.forEach((user) => {
        uids.push(user.data().uid);
        recipients[user.data().username] = true;
      });

      uids.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      });
      const chatID = uids.join("");
      await setDoc(doc(db, "chats", chatID), {
        name: chatName ?? "",
        recipients: recipients,
        chatID: chatID,
      });
      await setDoc(doc(db, "chats", chatID, "messages", "0"), {
        messages: {},
      });
      console.info('created chat');

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

      {chats && chats.map((chat) => (
        <button className="ring m-2" onClick={() => handleChangeChat(chat.chatID)} key={chat.chatID}>
          {chat.name !== "" ? (
            <div>{chat.name}</div>
          ) : (
            <div>{Object.keys(chat.recipients).filter((username) => chat.recipients[username] && username !== currUser.displayName).join(', ')}</div> // add ... at limit of last name
          )}

        </button>

      ))}


    </section>

  )
}
export default ChatBar;