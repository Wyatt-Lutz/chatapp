import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../../ChatProvider";
import { AuthContext } from "../../../AuthProvider";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../../../firebase";


const Chats = () => {
  const [chats, setChats] = useState([]);

  const {data} = useContext(ChatContext);
  const {currUser} = useContext(AuthContext);

  useEffect(() => {
    getChats();
    async function getChats() {
      if (!data.chatID) {
        return;
      }
      const snapshot = onSnapshot(doc(db, "chats", data.chatID), (doc) => {
        doc.exists() && setChats(doc.data().messages);
      });

      return () => {
        snapshot();
      };
    }

  }, [data.chatID])

  console.log(chats);



  return(
    <section>
      {chats.map((chat) => (
        <div>{chat.text}</div>
      ))}
    </section>
  )
}

export default Chats;
