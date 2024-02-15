import { useContext, useState, useEffect, useRef } from "react";
import { ChatContext } from "../../../ChatProvider";
import { AuthContext } from "../../../AuthProvider";
import { onSnapshot, doc, getDoc, orderBy, limit, arrayRemove, setDoc, getDocs, collection, Timestamp, arrayUnion, updateDoc, query, startAfter, serverTimestamp } from "firebase/firestore";
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
  const numChatsPerDoc = 5;
  const [numChats, setNumChats] = useState(0);




  const fetchChats = async () => {
    console.info('fetch Chats run');
    setLoading(true);
    try{
      const messagesRef = collection(db, "chats", data.chatID, "messages");
      const querySnapshot = await getDocs(messagesRef);

      const storedChats = querySnapshot.docs.map(doc => doc.data());
      let currMessages;
      if (numChats > 0 && !(storedChats[storedChats.length-numChats]?.messages.length < numChatsPerDoc)) {
        currMessages = storedChats[storedChats.length - 1 - numChats]?.messages;
      } else if (numChats === 0) {
        currMessages = storedChats[0]?.messages;
      } else {
        console.log ('no more chats to load') //toast -- would be more just nothing happens because scroll
      }


      if (Object.keys(currMessages).length < 1) {
        console.info('no chats in chat ');
        return;
      }
      //its broken, look at firestore to remind self
      if (initialMount.current) {
        const numOfExcess = currMessages.length - numChatsPerDoc;
        if (numOfExcess > 0) {
          console.info("ran message reallocation process")
          const nowOldMessagesInCurr = currMessages.slice(0, numChatsPerDoc);
          const nextChatBlockLeft = numChatsPerDoc - storedChats[storedChats.length-1].messages.length;
          if (nextChatBlockLeft !== 0) {
            await updateDoc(doc(messagesRef, (querySnapshot.docs.length - 1).toString()), {
              messages: arrayUnion(...currMessages.slice(0, nextChatBlockLeft)),
            });
          }
          for (let i = 0; i < Math.ceil((numOfExcess - nextChatBlockLeft)/numChatsPerDoc); i++) {
            const nextMessages = currMessages.slice(nextChatBlockLeft + (numChats * i), nextChatBlockLeft + ((numChats + 1) * i));
            console.log(nextMessages);
            await setDoc(doc(messagesRef, (querySnapshot.docs.length).toString()), {
              messages: nextMessages,
            })
          }

          await updateDoc(doc(messagesRef, "0"), {
            messages: arrayRemove(...nowOldMessagesInCurr),
          });
        }
      }

      setMessageData(currMessages.slice(currMessages.length - numChatsPerDoc, currMessages.length));





    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false);

    }


  }
      //const lastChated = querySnapshot.docs[querySnapshot.docs.length - 1]; // in other words the 49th index
      //setLastChat(lastChated);

  const fetchMoreChats = () => {
    setNumChats(n => n+1);
    if (!data.chatID) {
      console.error('No chatID, fetch more chats should not run');
      return;
    }

    if (lastChat) {
      fetchChats();
    } else {
      console.error('No last chat, fetch more chats should not run');
    }
  }


  useEffect(() => {
    chatListenerUseEffect();
    async function chatListenerUseEffect() {
      if (!data.chatID) {
        console.info("chatID undefined");
        return; //make it so that It doesnt try to load chats
      }
      setMessageData([]);
      initialMount.current = true;
      await fetchChats(null);
      console.info('reset message data');


      const chatRef = doc(db, "chats", data.chatID, "messages", "0");

      const chatListener = onSnapshot(chatRef, (snap) => {
        if(initialMount.current) {
          initialMount.current = false;
          console.info('chat listener subscribe')
          return;
        }
        console.info("chat listener ran");
        const newMessageData = snap.data();
        console.log(newMessageData.messages);
        setMessageData(newMessageData.messages);

        //setLastChat(newMessageData);
        //currMessage.current?.scrollIntoView({behavior:"smooth"})
      });
      return () => chatListener();

    }



  }, [data.chatID]);


  const addMessage = async({text}) => {
    resetField('text');
    console.info('added message to database')
    const chatID = uuidv4();
    await updateDoc(doc(db, "chats", data.chatID, "messages", "0"), {
      messages: arrayUnion({
        text: text,
        id: chatID,
        date: Date.now(),
        senderID: currUser.uid,
      })
    });

    //await new Promise((resolve) => setTimeout(resolve, 25)); //do I still need this
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
          {messageData.length > 0 && messageData.map((chat) => (

            <div className="text-xl font-bold py-2" key={chat.id}>{chat.text}</div>

          ))}



          <form onSubmit={handleSubmit(addMessage)}>
            <input placeholder="Type here..." {...register('text', { required: true, maxLength: 200})}></input>
          </form>

          <button onClick={() => fetchMoreChats()}>Load more</button>
          <div ref={currMessage}></div>

        </div>

      )}

    </div>
  )
}

export default Chats;
