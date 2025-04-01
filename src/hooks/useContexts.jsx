import { useContext } from "react";
import { ChatContext } from "../context/providers/ChatContext"
import { MemberContext } from "../context/providers/MemberContext";
import { MessageContext } from "../context/providers/MessageContext";

export const useChatContexts = () => {
  const { chatState, chatDispatch, resetAllChatContexts } = useContext(ChatContext);
  const { memberState, memberDispatch } = useContext(MemberContext);
  const { messageState, messageDispatch } = useContext(MessageContext);


  return { chatState, chatDispatch, resetAllChatContexts, memberState, memberDispatch, messageState, messageDispatch };

};
