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

const Messages = () => {
  const { chatState, memberState, messageState, messageDispatch } =
    useChatContexts();
  const { currUser } = useAuth();

  const { chatID, title, tempTitle } = chatState;
  const {
    numUnread,
    isAtBottom,
    endTimestamp,
    messages,
    isFirstMessageRendered,
  } = messageState;

  const [scrolled, setScrolled] = useState(false);
  const [editState, setEditState] = useState({});
  const [jsxNames, setJsxNames] = useState(null);

  const [memberContextMenuData, setMemberContextMenuData] = useState({});
  const [messageContextMenuData, setMessageContextMenuData] = useState({});
  const { contextMenu, setContextMenu, points, setPoints } = useContextMenu();

  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  //Intersection Observer configurations
  const [containerRef, isVisible] = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 1,
  });

  useEffect(() => {
    const names = tempTitle.split(", ");
    const newJsxNames =
      names.length === 3
        ? `${names[0]}, ${names[1]}, and ${names[2]}`
        : names.length === 2
          ? `${names[0]} and ${names[1]}`
          : names[0];
    setJsxNames(newJsxNames);
  }, [tempTitle]);

  useEffect(() => {
    if (!chatID) {
      console.info("chatID undefined");
      return;
    }

    const handleScroll = () => {
      const scrollTop = messagesContainerRef.current.scrollTop;
      setScrolled(true);
      if (scrollTop !== 0 && isAtBottom) {
        messageDispatch({ type: "UPDATE_IS_AT_BOTTOM", payload: false });
      } else if (scrollTop === 0 && !isAtBottom) {
        messageDispatch({ type: "UPDATE_IS_AT_BOTTOM", payload: true });
        messageDispatch({ type: "UPDATE_UNREAD", payload: 0 });
      }
    };

    const container = messagesContainerRef.current;

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [
    chatID,
    currUser.uid,
    messageDispatch,
    isAtBottom,
    isFirstMessageRendered,
  ]);

  useEffect(() => {
    const handleFetchMore = debounce(async () => {
      const messageData = await fetchOlderChats(db, chatID, endTimestamp);
      if (!messageData) return;
      const keysOfMessages = Object.keys(messageData);
      if (keysOfMessages.length > 0) {
        const timestampOfOldestMessage =
          messageData[keysOfMessages[0]].timestamp;
        messageDispatch({
          type: "UPDATE_END_TIMESTAMP",
          payload: timestampOfOldestMessage,
        });

        const newMessageMap = new Map(Object.entries(messageData));
        messageDispatch({ type: "ADD_OLDER_MESSAGES", payload: newMessageMap });
      }
    }, 300);

    if (!isFirstMessageRendered && isVisible && scrolled) {
      handleFetchMore();
    }
  }, [
    isVisible,
    scrolled,
    messageDispatch,
    chatID,
    endTimestamp,
    isFirstMessageRendered,
  ]);

  const changeEditState = (id, state) => {
    setEditState((prev) => ({ ...prev, [id]: state }));
  };

  const scrollToBottom = () => {
    console.log(lastMessageRef.current);
    console.log(isAtBottom);
    if (lastMessageRef.current && !isAtBottom) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
              {(isFirstMessageRendered || chatState.firstMessageID === "") &&
                (title ? (
                  <div className="text-center text-lg mb-2">
                    This is the start of{" "}
                    <span className="font-semibold">{title}</span>
                  </div>
                ) : chatState.numOfUsers > 3 ? (
                  <div className="text-center text-lg mb-2">
                    This is the start of your chat with{" "}
                    <span className="font-semibold">
                      {tempTitle +
                        ", and " +
                        chatState.numOfMembers -
                        3 +
                        " other users"}
                    </span>{" "}
                  </div>
                ) : (
                  <div className="text-center text-lg mb-2">
                    This is the start of your chat with{" "}
                    <span className="font-semibold">{jsxNames}</span>
                  </div>
                ))}
              {[...messages].map(([messageUid, messageData], index) => {
                const memberDataOfSender = memberState.members.get(
                  messageData.sender,
                );
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

                    {index === messages.size - 1 && (
                      <div ref={lastMessageRef} />
                    )}
                  </div>
                );
              })}
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
