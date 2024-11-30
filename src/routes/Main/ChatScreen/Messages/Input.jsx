import { memo, useCallback, useContext } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../../providers/AuthProvider";
import { ChatContext } from "../../../../providers/ChatProvider";
import { db } from "../../../../../firebase";
import { addMessage } from "../../../../services/messageDataService";


const Input = ({calculateRenderTimeAndSender}) => {
  const { register, handleSubmit, resetField } = useForm();
  const { currUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  console.log('input run');
  const handleAddMessage = useCallback(async(text) => {
    resetField('text');
    const renderTimeAndSender = await calculateRenderTimeAndSender();
    const timeData = await addMessage(text.text, data.chatID, currUser.uid, db, renderTimeAndSender);
    if (timeData.renderState) {
      localStorage.setItem('timestamp', timeData.time);
    }
  }, [data.chatID]);


  return (
    <>

      <form onSubmit={handleSubmit(handleAddMessage)}>
        <input placeholder="Type here..." {...register('text', { required: false, maxLength: 200})} />
      </form>

    </>
  )
}
export default memo(Input);