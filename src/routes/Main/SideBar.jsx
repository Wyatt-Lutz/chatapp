import { useContext, useState } from "react";
import Plus from "../../svg/Plus";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../AuthProvider";
import {collection, getDocs} from 'firebase/firestore';
import { db } from "../../../firebase";
const SideBar = () => {

  const [isAddUser, setAddUser] = useState(false);
  const {register, handleSubmit} = useForm();
  const {currentUser} = useContext(AuthContext);

  const addUser = async ({recipient}) => {
    try {
      const docRef = collection(db, 'users');
      const snap = await getDocs(docRef);
      const recipientUser = snap.docs.find((doc) => doc.data().username === recipient);
      if (!recipientUser) {
        console.info('user does not exist') //toast
      }

      const recipientID = recipientUser.data()?.uid;
      const chatID = currentUser.uid > recipientID ? currentUser.uid + recipientID : recipientID + currentUser.uid;
      await setDoc(doc(db, "chats"), {

        chatID: chatID,
        messages: {},


      });



    } catch (error) {
      console.error(error);
    }




/*

*/



  }



  return(
    <section>

      <button onClick={() => setAddUser(true)}><Plus /></button>
      {isAddUser && (
        <div className="opacity-30 inset-0 fixed bg-black">
          <form onSubmit={handleSubmit(addUser)}>
            <input {...register('recipient', { required: true })}></input>
            <button type="submit">Find User</button>
          </form>
        </div>

      )}
    </section>

  )
}
export default SideBar;