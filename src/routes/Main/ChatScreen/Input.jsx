import { Fragment, memo, useCallback, useContext, useMemo } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../AuthProvider";
import { ChatContext } from "../../../ChatProvider";
import { db } from "../../../../firebase";
import { addMessage } from "./useChatData";
import { useQueryClient } from "@tanstack/react-query";


const Input = () => {
  const { register, handleSubmit, resetField } = useForm();
  const { currUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const queryClient = useQueryClient();

  console.log('input run');
  const handleAddMessage = useCallback(async(text) => {
    resetField('text');
    const prevTimestamp = localStorage.getItem('timestamp');
    const existingData = queryClient.getQueryData(['messages', data.chatID]);
    const previousMessage = existingData[existingData?.length - 1];
    let renderTimeAndSender = true;
    if (prevTimestamp && previousMessage.sender === currUser.displayName && Date.now() - prevTimestamp < 180000) {
      renderTimeAndSender = false;
    }


    const timeData = await addMessage(text.text, data.chatID, currUser.displayName, db, renderTimeAndSender);
    if (timeData.renderState) {
      localStorage.setItem('timestamp', timeData.time);
    }
  }, [data.chatID]);


  return (
    <Fragment>

      <form onSubmit={handleSubmit(handleAddMessage)}>
        <input placeholder="Type here..." {...register('text', { required: false, maxLength: 200})} />
      </form>

    </Fragment>
  )
}
export default memo(Input);