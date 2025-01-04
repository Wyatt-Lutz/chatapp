import { memo, useContext } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../../providers/AuthProvider";
import { ChatContext } from "../../../../providers/ChatContext";
import { db } from "../../../../../firebase";
import { addMessage, calculateRenderTimeAndSender } from "../../../../services/messageDataService";


const Input = () => {
  const { register, handleSubmit, resetField } = useForm();
  const { currUser } = useContext(AuthContext);
  const { chatState, messageState } = useContext(ChatContext);

  console.log('input run');
  const handleAddMessage = async({ text }) => {
    resetField('text');
    const lastMessage = [...messageState.messages].pop() || {};
    const willRenderTimeAndSender = calculateRenderTimeAndSender(lastMessage, currUser.displayName);
    await addMessage(text, chatState.chatID, currUser.uid, db, willRenderTimeAndSender);
  };

  return (
    <>

      <form onSubmit={handleSubmit(handleAddMessage)}>
        <input placeholder="Type here..." {...register('text', { required: false, maxLength: 200})} />
      </form>

    </>
  )
}
export default memo(Input);