import { useState, useEffect, useRef } from "react";
import { db } from "../../../../../firebase";
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
import DownArrow from "../../../../components/ui/DownArrow";
import { useScrollListener } from "../../../../hooks/useScrollListener";
import StartOfChatBanner from "./StartOfChatBanner";

const Messages = () => {
  const { chatState, memberState, messageState, messageDispatch } =
    useChatContexts();
  const { currUser } = useAuth();

  const { chatID, title, tempTitle, numOfMembers, firstMessageID } = chatState;
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

  useScrollListener(containerRef, isAtBottom, messageDispatch);

  const [editState, setEditState] = useState({});

  const [memberContextMenuData, setMemberContextMenuData] = useState({});
  const [messageContextMenuData, setMessageContextMenuData] = useState({});
  const { contextMenu, setContextMenu, points, setPoints } = useContextMenu();

  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (!isFirstMessageRendered && isVisible) {
      const debouncedFetch = debounce(async () => {
        await handleFetchMore();
      }, 300);
      debouncedFetch();
      return () => debouncedFetch.cancel();
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

  const scrollToBottom = () => {
    if (lastMessageRef.current && !isAtBottom) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
            onMemberContextMenu={(e, memberUid, memberData) => {
              e.preventDefault();
              setContextMenu({ member: true });
              setPoints({ member: { x: e.pageX, y: e.pageY } });
              setMemberContextMenuData({ memberUid, memberData });
            }}
            onMessageContextMenu={(e, messageUid, messageData) => {
              e.preventDefault();
              setContextMenu({ messages: true });
              setPoints({ messages: { x: e.pageX, y: e.pageY } });
              setMessageContextMenuData({ messageUid, messageData });
            }}
          />

          {index === messages.size - 1 && <div ref={lastMessageRef} />}
        </div>
      );
    });
  };

  return (
    <div className="w-full h-full rounded-lg shadow-md">
      <div
        ref={messagesContainerRef}
        className="max-h-[800px] w-[1000px] overflow-y-auto px-4 py-2 space-y-2 no-scrollbar flex flex-col-reverse scroll-smooth"
      >
        <div className="flex-grow">
          {!messages ? (
            <div className="text-center text-red-900 py-4">Loading...</div>
          ) : (
            <>
              <StartOfChatBanner
                title={title}
                tempTitle={tempTitle}
                numOfMembers={numOfMembers}
                isFirstMessageRendered={isFirstMessageRendered}
                firstMessageID={firstMessageID}
              />
              {renderMessages()}
            </>
          )}
          {!isAtBottom && (
            <button
              className="absolute bottom-40 right-120 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition"
              onClick={scrollToBottom}
            >
              <DownArrow />
            </button>
          )}

          <div className="bg-gray-500 rounded-md py-1 px-2">
            <Input />
          </div>
        </div>

        <div ref={containerRef}></div>
      </div>

      {numUnread > 0 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full shadow">
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
