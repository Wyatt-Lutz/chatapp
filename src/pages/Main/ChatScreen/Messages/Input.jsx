import { useForm } from "react-hook-form";
import { db } from "../../../../../firebase";
import { addMessage } from "../../../../services/messageDataService";
import Smile from "../../../../components/ui/Smile";
import { calculateRenderTimeAndSender } from "../../../../utils/messageUtils";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";



const Input = () => {
  const { register, handleSubmit, resetField } = useForm();
  const { currUser } = useAuth();
  const { chatState, messageState, chatDispatch } = useChatContexts();


  const handleAddMessage = async({ text }) => {
    resetField('text');
    const lastMessage = [...messageState.messages].pop() || {};
    const willRenderTimeAndSender = calculateRenderTimeAndSender(lastMessage, currUser.displayName);
    await addMessage(text, chatState.chatID, currUser.uid, db, willRenderTimeAndSender, chatState.firstMessageID, chatDispatch);
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
