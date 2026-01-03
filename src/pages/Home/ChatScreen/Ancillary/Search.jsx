import { useEffect, useState } from "react";
import Message from "../Messages/Message";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";
import { queryMessages } from "../../../../services/messageDataService";
import { db } from "../../../../firebase";

const Search = ({ setIsSearchingMessages }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { chatState, memberState } = useChatContexts();
  const { currUser } = useAuth();
  const chatID = chatState.chatID;
  const [searchedMessages, setSearchedMessages] = useState(new Map());

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchedMessages(new Map());
      return;
    }

    const fetchMessages = async () => {
      const messagesObject = await queryMessages(db, chatID, searchQuery);
      if (!messagesObject) {
        setSearchedMessages(new Map());
        return;
      }

      const messagesArray = Object.entries(messagesObject);
      setSearchedMessages(new Map(messagesArray));
    };

    const timeout = setTimeout(() => {
      fetchMessages();
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, chatID]);

  return (
    <aside className="fixed inset-0 lg:relative lg:w-72 flex flex-col bg-zinc-900 lg:bg-zinc-800/40 border-l border-zinc-700 z-30 lg:z-0">
      <div className="p-4 border-b border-zinc-700/70 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100">Search Messages</h3>
        <button
          onClick={() => setIsSearchingMessages(false)}
          className="p-1.5 rounded-lg hover:bg-zinc-800 transition"
          aria-label="Close search"
        >
          <svg
            className="w-5 h-5 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 border-b border-zinc-700/70">
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-zinc-800/70 border border-zinc-700/70 px-4 py-3 pl-11 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition"
          />
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {searchQuery.trim() === "" ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <svg
              className="w-16 h-16 text-zinc-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-zinc-400 text-sm">
              Search for messages in this chat
            </p>
          </div>
        ) : searchedMessages && searchedMessages.size > 0 ? (
          <div className="space-y-3">
            {[...searchedMessages].map(([messageID, messageData], index) => (
              <div
                key={messageID}
                className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800/70 transition"
              >
                <Message
                  messageUid={messageID}
                  memberDataOfSender={memberState.members.get(
                    messageData.sender,
                  )}
                  messageData={messageData}
                  isEditing={false}
                  changeEditState={() => {}}
                  index={index}
                  currentUserId={currUser.uid}
                  onMemberContextMenu={() => {}}
                  onMessageContextMenu={() => {}}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <svg
              className="w-16 h-16 text-zinc-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-zinc-400 text-sm">No messages found</p>
            <p className="text-zinc-500 text-xs mt-1">
              Try a different search term
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Search;
