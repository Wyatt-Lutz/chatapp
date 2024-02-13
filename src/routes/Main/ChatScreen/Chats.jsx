import { useContext, useState, useEffect, useRef } from "react";
import { ChatContext } from "../../../ChatProvider";
import { AuthContext } from "../../../AuthProvider";
import { onSnapshot, doc, getDoc, getDocs, collection, Timestamp, arrayUnion, updateDoc, query, startAfter } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';
//import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";



/*
  51K reads
  171 writes


*/

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [lastChat, setLastChat] = useState(null);
  const { register, handleSubmit, resetField } = useForm();
  const {data} = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);
  //const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const endOfChatsRef = useRef(null);




  const fetchChats = async (startAfterChat = null) => {
    console.log('fetch More Chats run');
    setLoading(true);
    try{
      const chatQuery = query(collection(db, "chats", data.chatID).orderBy("date").limit(50), startAfterChat ? startAfter(lastChat) : undefined);
      const querySnapshot = await getDocs(chatQuery);
      const messages = querySnapshot.data().messages;
      const lastChated = messages[messages.length - 1]; // otherwise the 49th index
      setLastChat(lastChated);
      startAfterChat ? setChats((prev) => [...prev, messages]) : setChats(messages); //test if I can just have ...prev even if setChats is empty array

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false);
    }


  }
  const fetchMoreChats = () => {
    if (!data.chatID || !lastChat) {
      console.error('No last chat or chatID, fetch more chats shouldnt run')
      return; //toast error or somthing
    }
    fetchChats(lastChat);

  }

  useEffect(() => {

    if (!data.chatID) {
      console.info("chatID undefined");
      return; //make it so that It doesnt try to load chats
    }
    if (data.chatID) {
      fetchChats();
    }

    const chatListener = onSnapshot(doc(db, "chats", data.chatID), (snap) => {
      console.log("chat listener ran");
      const messages = snap.data()?.messages || [];
      setChats(messages);
      const lastChated = messages.length > 0 ? messages[messages.length-1] : null;
      setLastChat(lastChated);
    });

    return () => chatListener();
  }, [])


  const addMessage = async({text}) => {
    resetField('text');
    console.info('added message to database')


    await updateDoc(doc(db, "chats", data.chatID), {
      messages: arrayUnion({
        text: text,
        date: Timestamp.now(),
        id: uuidv4(),
        senderID: currUser.uid,
      })
    });
  };

  const handleScroll = () => {
    console.info('handle scroll run')
    if (endOfChatsRef.current && endOfListRef.current.getBoundingClientRect().top <= window.innerHeight && !loading) {{
      fetchMoreChats();
    }}
  };


  return(
    <section onScroll={handleScroll}>

      {!data.chatID && (
        <div>Friends online:</div> //firends online
      )}
      {chats.map((chat) => (
        <div key={chat.id}>{chat.text}</div>
      ))}
      <div ref={endOfChatsRef}></div>
      <form onSubmit={handleSubmit(addMessage)}>
        <input placeholder="Type here..." {...register('text', { required: true, maxLength: 200})}></input>
      </form>
    </section>
  )
}

export default Chats;
