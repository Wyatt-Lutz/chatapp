import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import { useElementOnScreen } from "../../../../hooks/useIntersectionObserver";
import { fetchOlderChats } from "../../../../services/messageDataService";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import Message from "./Message";
import Input from "./Input";
import MessagesContextMenu from "./MessagesContextMenu";
import MemberContextMenu from "../MembersBar/MemberContextMenu";
import { useScrollListener } from "../../../../hooks/useScrollListener";
import StartOfChatBanner from "./StartOfChatBanner";
import { db } from "../../../../firebase";

const Messages = ({ isSidebarCollapsed }) => {
  const { chatState, memberState, messageState, messageDispatch } =
    useChatContexts();
  const { currUser } = useAuth();

  const { chatID, title, membersTitle, numOfMembers, firstMessageID } =
    chatState;
  const {
    numUnread,
    isAtBottom,
    endTimestamp,
    messages,
    isFirstMessageRendered,
  } = messageState;

  //Intersection Observer configurations
  const [containerRef, isVisible] = useElementOnScreen({
    root: null,
    rootMargin: "1000px",
    threshold: 1,
  });

  const [editState, setEditState] = useState({});

  const [memberContextMenuData, setMemberContextMenuData] = useState({});
  const [messageContextMenuData, setMessageContextMenuData] = useState({});
  const { contextMenu, setContextMenu, points, setPoints } = useContextMenu();

  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  useScrollListener(messagesContainerRef, isAtBottom, messageDispatch);

  const prevChatIDRef = useRef(null);

  useEffect(() => {
    if (isAtBottom && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    if (!chatID) return;

    const switchedChat = prevChatIDRef.current !== chatID;
    const hasMessages = messages && messages.size > 0;

    if (switchedChat && !hasMessages) return;

    if (switchedChat && lastMessageRef.current) {
      const container = messagesContainerRef.current;
      if (container) {
        if (window.innerWidth < 768) {
          container.scrollTop = container.scrollHeight;
          setTimeout(() => {
            if (container) {
              container.scrollTop = container.scrollHeight + 1000;
            }
          }, 75);
        } else {
          lastMessageRef.current.scrollIntoView({ behavior: "auto" });
        }
      }
    }

    prevChatIDRef.current = chatID;
  }, [chatID, messages]);

  useEffect(() => {
    if (!isFirstMessageRendered && isVisible) {
      const debouncedFetch = debounce(async () => {
        await handleFetchMore();
      }, 300);
      debouncedFetch();
      return () => debouncedFetch.cancel();
    }
    if (firstMessageID === "") {
      messageDispatch({
        type: "UPDATE_IS_FIRST_MESSAGE_RENDERED",
        payload: true,
      });
    }
  }, [isVisible, isFirstMessageRendered]);

  const handleFetchMore = async () => {
    const messageData = await fetchOlderChats(db, chatID, endTimestamp);
    if (!messageData) return;

    const newMessageMap = new Map(Object.entries(messageData));
    messageDispatch({ type: "ADD_OLDER_MESSAGES", payload: newMessageMap });
    const keysOfMessages = Object.keys(messageData);
    if (keysOfMessages.length > 0) {
      const timestampOfOldestMessage = messageData[keysOfMessages[0]].timestamp;
      messageDispatch({
        type: "UPDATE_END_TIMESTAMP",
        payload: timestampOfOldestMessage,
      });
    }
    if (keysOfMessages.some((key) => key === firstMessageID)) {
      messageDispatch({
        type: "UPDATE_IS_FIRST_MESSAGE_RENDERED",
        payload: true,
      });
    }
  };

  const changeEditState = (id, state) => {
    setEditState((prev) => ({ ...prev, [id]: state }));
  };

  const renderMessages = () => {
    return [...messages].map(([messageUid, messageData], index) => {
      const memberDataOfSender = memberState.members.get(messageData.sender);
      return (
        <div key={messageUid}>
          <Message
            messageUid={messageUid}
            memberDataOfSender={memberDataOfSender}
            messageData={messageData}
            isEditing={editState[messageUid]}
            changeEditState={changeEditState}
            index={index}
            currentUserId={currUser.uid}
            onMemberContextMenu={(e, memberUid, memberData) => {
              e.preventDefault();
              setContextMenu({ member: true });
              setPoints({ member: { x: e.pageX, y: e.pageY } });
              setMemberContextMenuData({ memberUid, memberData });
            }}
            onMessageContextMenu={(e, messageUid, messageData) => {
              e.preventDefault();
              setContextMenu({ messages: true });
              setPoints({ messages: { x: e.clientX, y: e.clientY } });
              setMessageContextMenuData({ messageUid, messageData });
            }}
          />

          {index === messages.size - 1 && <div ref={lastMessageRef} />}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-zinc-900">
      <div
        className="flex-1 overflow-auto px-2 md:px-4 py-4 space-y-4 no-scrollbar min-h-0"
        ref={messagesContainerRef}
      >
        {!messages ? (
          <div className="text-center text-zinc-400 py-4">Loading...</div>
        ) : (
          <div className="w-full">
            <StartOfChatBanner
              title={title}
              membersTitle={membersTitle}
              numOfMembers={numOfMembers}
              isFirstMessageRendered={isFirstMessageRendered}
            />
            <div className="flex flex-col space-y-3">{renderMessages()}</div>
          </div>
        )}

        <div ref={containerRef} />
      </div>

      <div
        className={`shrink-0 px-2 md:px-4 py-2 md:py-3 border-t border-zinc-700 bg-zinc-800/40 ${
          !isSidebarCollapsed ? "md:-ml-80 md:w-[calc(100%+20rem)]" : ""
        }`}
      >
        <div className="w-full">
          <Input />
        </div>
      </div>

      {numUnread > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-3 md:px-4 py-1 text-sm rounded-full shadow z-10">
          {numUnread} new messages
        </div>
      )}

      {contextMenu.member &&
        memberContextMenuData.memberUid !== currUser.uid && (
          <MemberContextMenu
            contextMenuData={memberContextMenuData}
            points={points.member}
          />
        )}

      {contextMenu.messages &&
        messageContextMenuData.messageData.sender !== "server" &&
        (messageContextMenuData.messageData.sender === currUser.uid ||
          currUser.uid === chatState.owner) && (
          <MessagesContextMenu
            changeEditState={changeEditState}
            contextMenuData={messageContextMenuData}
            points={points.messages}
          />
        )}
    </div>
  );
};

export default Messages;
