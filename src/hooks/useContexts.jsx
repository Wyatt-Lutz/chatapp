import { useContext } from "react";
import { ChatContext } from "../context/providers/ChatContext";
import { MemberContext } from "../context/providers/MemberContext";
import { MessageContext } from "../context/providers/MessageContext";
import { ChatroomsContext } from "../context/providers/ChatroomsContext";

export const useChatContexts = () => {
  const { chatroomsState, chatroomsDispatch } = useContext(ChatroomsContext);
  const { chatState, chatDispatch } = useContext(ChatContext);
  const { memberState, memberDispatch } = useContext(MemberContext);
  const { messageState, messageDispatch } = useContext(MessageContext);

  const resetAllChatContexts = () => {
    chatDispatch({ type: "RESET" });
    memberDispatch({ type: "RESET" });
    messageDispatch({ type: "RESET" });
  };

  return {
    chatroomsState,
    chatroomsDispatch,
    chatState,
    chatDispatch,
    memberState,
    memberDispatch,
    messageState,
    messageDispatch,
    resetAllChatContexts,
  };
};
