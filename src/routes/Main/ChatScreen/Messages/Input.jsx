import { memo, useContext } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../../providers/AuthProvider";
import { ChatContext } from "../../../../providers/ChatContext";
import { MessagesContext } from "../../../../providers/MessagesContext";
import { db } from "../../../../../firebase";
import { addMessage, calculateRenderTimeAndSender } from "../../../../services/messageDataService";


const Input = () => {
  const { register, handleSubmit, resetField } = useForm();
  const { currUser } = useContext(AuthContext);
  const { chatRoomData } = useContext(ChatContext);
  const { messagesData } = useContext(MessagesContext);

  console.log('input run');
  const handleAddMessage = async(text) => {
    resetField('text');
    
    const lastMessage = [...messagesData.messages.entries()].pop() || {};
    console.log(lastMessage);
    const willRenderTimeAndSender = await calculateRenderTimeAndSender(lastMessage, currUser.displayName);
    await addMessage(text.text, chatRoomData.chatID, currUser.uid, db, willRenderTimeAndSender);


  };

  return (
    <>

      <form onSubmit={handleSubmit(handleAddMessage)}>
        <input placeholder="Type here..." {...register('text', { required: false, maxLength: 200})} />
      </form>

    </>
  )
}
export default Input;