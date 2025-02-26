import { useContext } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../../context/AuthContext";
import { ChatContext } from "../../../../context/ChatContext";
import { db } from "../../../../../firebase";
import { addMessage, calculateRenderTimeAndSender } from "../../../../services/messageDataService";

import Smile from "../../../../components/ui/Smile";



const Input = () => {
  const { register, handleSubmit, resetField } = useForm();
  const { currUser } = useContext(AuthContext);
  const { chatState, messageState } = useContext(ChatContext);



  console.log('input run');
  const handleAddMessage = async({ text }) => {
    resetField('text');
    const lastMessage = [...messageState.messages].pop() || {};
    const willRenderTimeAndSender = calculateRenderTimeAndSender(lastMessage, currUser.displayName);
    await addMessage(text, chatState.chatID, currUser.uid, db, willRenderTimeAndSender, chatState.firstMessageID);
  };



  return (
    <>

      <form onSubmit={handleSubmit(handleAddMessage)}>
        <input placeholder="Type here..." {...register('text', { required: false, maxLength: 200})} />
        <button><Smile /></button>
      </form>



    </>
  )
}
export default Input;