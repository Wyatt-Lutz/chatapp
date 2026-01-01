import { addMessage } from "../../../../services/messageDataService";
import { calculateIfShowTimeAndSender } from "../../../../utils/messageUtils";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useEffect, useRef, useState } from "react";
import { compressImage } from "../../../../utils/mediaUtils";
import "emoji-picker-element";

import Smile from "../../../../components/ui/Smile";
import Plus from "../../../../components/ui/Plus";
import CloseFile from "../../../../components/ui/CloseFile";
import { db } from "../../../../firebase";

const Input = () => {
  const { currUser } = useAuth();
  const { chatState, messageState, memberState } = useChatContexts();
  const [fileToUpload, setFileToUpload] = useState(null);
  const [text, setText] = useState("");
  const textInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleAddMessage = async (e) => {
    e.preventDefault();
    setText("");
    const trimmedText = text.trimEnd();
    if (!trimmedText && !fileToUpload) return;
    if (fileToUpload) {
      setFileToUpload(null);
      URL.revokeObjectURL(fileToUpload);
    }
    const messageKeys = Array.from(messageState.messages.keys());
    const lastMessage =
      messageKeys.length > 0
        ? messageState.messages.get(messageKeys[messageKeys.length - 1])
        : null;
    const willShowTimeAndSender = calculateIfShowTimeAndSender(
      lastMessage,
      currUser.uid,
    );

    await addMessage(
      trimmedText,
      chatState.chatID,
      currUser.uid,
      db,
      willShowTimeAndSender,
      memberState.members,
      fileToUpload,
    );
  };

  const handlePickImage = async (e) => {
    const file = e.target.files[0];
    e.target.value = null; //Allows the onChange to trigger again if the user tries to add the same picture to a different message
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const compressedImage = await compressImage(file);
      setFileToUpload(compressedImage);
    } else {
      setFileToUpload(file);
    }

    textInputRef.current?.focus(); //Will refocus the text input so the user doesn't have to reclick the input to send the message
  };

  const handleRemoveImage = () => {
    setFileToUpload(null);
    URL.revokeObjectURL(fileToUpload);
    textInputRef.current?.focus();
  };

  useEffect(() => {
    const emojiPicker = emojiPickerRef.current;
    if (!isEmojiPickerOpen || !emojiPicker) return;

    const handleEmojiClick = (e) => {
      const emoji = e.detail.unicode;
      setText((prev) => prev + emoji);
    };

    const handleClickOutside = (e) => {
      if (!emojiPicker.contains(e.target)) {
        setIsEmojiPickerOpen(false);
      }
    };

    emojiPicker.addEventListener("emoji-click", handleEmojiClick);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      emojiPicker.removeEventListener("emoji-click", handleEmojiClick);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEmojiPickerOpen]);

  return (
    <form onSubmit={handleAddMessage} className="w-full">
      {fileToUpload && (
        <div className="relative w-32 h-32 mb-3 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 mx-auto sm:mx-0">
          {fileToUpload.type.startsWith("image/") ? (
            <img
              src={
                fileToUpload instanceof Blob &&
                fileToUpload.type.startsWith("image/")
                  ? URL.createObjectURL(fileToUpload)
                  : null
              }
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center px-4 text-center text-sm text-zinc-100">
              {fileToUpload.name}
            </div>
          )}

          <div className="absolute inset-0 flex items-start justify-end p-2">
            <button
              onClick={handleRemoveImage}
              className="bg-rose-600 text-white rounded-full p-1 shadow hover:bg-rose-500"
              aria-label="Remove attachment"
            >
              <CloseFile />
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="shrink-0 self-stretch flex items-center">
            <label
              htmlFor="filePicker"
              className={`cursor-pointer inline-flex items-center justify-center h-11 w-11 rounded-xl border border-violet-700/70 bg-violet-900/40 text-violet-300 shadow-sm transition hover:-translate-y-px hover:border-violet-500 hover:bg-violet-900/60 ${fileToUpload ? "opacity-50 pointer-events-none" : ""}`}
              aria-label="Attach file"
            >
              <Plus />
            </label>
            <input
              type="file"
              id="filePicker"
              disabled={fileToUpload}
              hidden
              onChange={handlePickImage}
            />
          </div>

          <div className="flex-1 flex items-center gap-2 rounded-2xl border border-zinc-700/70 bg-zinc-800/70 px-3 py-2 shadow-lg">
            <textarea
              className="flex-1 bg-transparent border-0 text-zinc-50 placeholder-zinc-500 resize-none focus:ring-0 focus:outline-none text-sm sm:text-base leading-relaxed"
              value={text}
              placeholder="Message your chat..."
              ref={textInputRef}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
              rows={1}
              onInput={(e) => {
                const el = e.target;
                el.style.height = "auto";
                const maxHeight = 160; // cap growth so the input doesn't overrun the screen
                const nextHeight = Math.min(el.scrollHeight, maxHeight);
                el.style.height = `${nextHeight}px`;
                el.style.overflowY =
                  el.scrollHeight > maxHeight ? "auto" : "hidden";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddMessage(e);
                }
              }}
            />

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                className="h-9 w-9 rounded-lg border border-zinc-700/70 bg-zinc-800/80 text-zinc-100 grid place-items-center transition hover:border-zinc-500"
                aria-label="Toggle emoji picker"
              >
                <Smile />
              </button>

              <button
                type="submit"
                disabled={!text.trim() && !fileToUpload}
                className="h-9 px-4 rounded-lg font-medium text-white transition bg-linear-to-tr from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {isEmojiPickerOpen && (
          <div className="absolute bottom-[calc(100%+0.5rem)] right-0 z-20 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
            <emoji-picker class="dark" ref={emojiPickerRef}></emoji-picker>
          </div>
        )}
      </div>
    </form>
  );
};
export default Input;
