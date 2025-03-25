import { useContext } from "react";
import { ChatContext } from "../context/providers/ChatContext"
import { MemberContext } from "../context/providers/MemberContext";
import { MessageContext } from "../context/providers/MessageContext";

const useChatContexts = () => {
  const { chatState, chatDispatch } = useContext(ChatContext);
  const { memberState, memberDispatch } = useContext(MemberContext);
  const { messageState, messageDispatch } = useContext(MessageContext);

  return { chatState, chatDispatch, memberState, memberDispatch, messageState, messageDispatch };

};

export default useChatContexts;
