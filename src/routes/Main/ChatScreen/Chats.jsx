import { useContext, useState, useEffect, useRef } from "react";
import { ChatContext } from "../../../ChatProvider";
import { AuthContext } from "../../../AuthProvider";
import { onSnapshot, doc, getDoc, orderBy, limit, setDoc, getDocs, collection, Timestamp, arrayUnion, updateDoc, query, startAfter, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';
import { initializeApp } from "firebase/app";
//import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";



/*
  51K reads
  171 writes


*/

const Chats = () => {
  const [messageData, setMessageData] = useState([]);
  const [lastChat, setLastChat] = useState(null);
  const { register, handleSubmit, resetField } = useForm();
  const {data} = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);
  //const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const endOfChatsRef = useRef(true);
  const initialMount = useRef(true);
  const currMessage = useRef();




  const fetchChats = async (startAfterChat) => {
    console.info('fetch Chats run');
    setLoading(true);
    try{
      const messageData = [];
      const chatRef = collection(db, "chats", data.chatID, "messages");

      const chatQuery = startAfterChat
        ? query(chatRef, orderBy("date", "desc"), startAfter(startAfterChat), limit(25))
        : query(chatRef, orderBy("date", "desc"), limit(25));
      const querySnapshot = await getDocs(chatQuery);
      if (querySnapshot.empty) {
        console.info('querySnap at fetch chats empty');
        return;
      }
      querySnapshot.forEach((chat) => {
        messageData.push(chat.data());
      })
      setMessageData((prev) => [...messageData.reverse(), ...prev]);

      const lastChated = querySnapshot.docs[querySnapshot.docs.length - 1]; // in other words the 49th index
      setLastChat(lastChated);


    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false);

    }


  }

  const fetchMoreChats = () => {
    if (!data.chatID) {
      console.error('No chatID, fetch more chats should not run');
      return;
    }

    if (lastChat) {
      fetchChats(lastChat);
    } else {
      console.error('No last chat, fetch more chats should not run');
    }
  }


  useEffect(() => {
    if (!data.chatID) {
      console.info("chatID undefined");
      return; //make it so that It doesnt try to load chats
    }
    setMessageData([]);
    initialMount.current = true;
    fetchChats(null);
    console.info('reset message data');


    const chatRef = collection(db, "chats", data.chatID, "messages");
    const chatQuery = query(chatRef, orderBy("date", "desc"));


    const chatListener = onSnapshot(chatQuery, (snap) => {
      if(initialMount.current) {
        initialMount.current = false;
        return;
      }
      console.info("chat listener ran");
      const newMessageData = snap.docs[0].data();
      setMessageData((prev) => [...prev, newMessageData]);

      setLastChat(newMessageData);
      currMessage.current?.scrollIntoView({behavior:"smooth"})

    });


    return () => chatListener();

  }, [data.chatID]);


  const addMessage = async({text}) => {
    resetField('text');
    console.info('added message to database')
    const chatID = uuidv4();
    await setDoc(doc(db, "chats", data.chatID, "messages", chatID), {
        text: text,
        id: chatID,
        date: Date.now(),
        senderID: currUser.uid,
    });

    await new Promise((resolve) => setTimeout(resolve, 25));
  };

  const handleScroll = () => {
    console.info('handle scroll run')
    const scrollY = window.scrollY;
    if (scrollY <= 100) {
      fetchMoreChats(lastChat);
    }
  };
/*
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return() => {
      window.removeEventListener('scroll', handleScroll);
    }
  }, [data.chatID, lastChat]);
*/


  return(
    <div>

      {!data.chatID ? (
        <div>Friends online:</div> //firends online
      ) : (
        <div>
          {messageData.map((chat) => (

            <div className="text-xl font-bold py-2" key={chat.id}>{chat.text}</div>

          ))}



          <form onSubmit={handleSubmit(addMessage)}>
            <input placeholder="Type here..." {...register('text', { required: true, maxLength: 200})}></input>
          </form>

          <button onClick={() => fetchChats(lastChat)}>Load more</button>
          <div ref={currMessage}></div>

        </div>

      )}

    </div>
  )
}

export default Chats;
