import { db } from "../../../../../firebase";
import { addMessage } from "../../../../services/messageDataService";
import { calculateRenderTimeAndSender } from "../../../../utils/messageUtils";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";
import { lazy, useEffect, useRef, useState } from "react";
import { compressImage } from "../../../../utils/mediaUtils";
import "emoji-picker-element";

const Smile = lazy(() => import("../../../../components/ui/Smile"));
const Plus = lazy(() => import("../../../../components/ui/Plus"));
const CloseFile = lazy(() => import("../../../../components/ui/CloseFile"));

const Input = () => {
  const { currUser } = useAuth();
  const { chatState, messageState, chatDispatch } = useChatContexts();
  const [imageToUpload, setImageToUpload] = useState(null);
  const [text, setText] = useState("");
  const textInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleAddMessage = async (e) => {
    e.preventDefault();
    setText("");
    const trimmedText = text.trim();
    if (!trimmedText && !imageToUpload) return;
    if (imageToUpload) {
      setImageToUpload(null);
      URL.revokeObjectURL(imageToUpload);
    }
    const messageKeys = Array.from(messageState.messages.keys());
    const lastMessage =
      messageKeys.length > 0
        ? messageState.messages.get(messageKeys[messageKeys.length - 1])
        : null;
    const willRenderTimeAndSender = calculateRenderTimeAndSender(
      lastMessage,
      currUser.uid,
    );

    await addMessage(
      trimmedText,
      chatState.chatID,
      currUser.uid,
      db,
      willRenderTimeAndSender,
      chatState.firstMessageID,
      chatDispatch,
      imageToUpload,
    );
  };

  const handlePickImage = async (e) => {
    const file = e.target.files[0];
    e.target.value = null; //Allows the onChange to trigger again if the user tries to add the same picture to a different message
    if (!file) return;
    const compressedImage = await compressImage(file);
    setImageToUpload(compressedImage);
    textInputRef.current?.focus(); //Will refocus the text input so the user doesn't have to reclick the input to send the message
  };

  const handleRemoveImage = () => {
    setImageToUpload(null);
    URL.revokeObjectURL(imageToUpload);
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
  }, [emojiPickerRef.current, isEmojiPickerOpen]);

  return (
    <div>
      {imageToUpload && (
        <div className="relative w-20 h-20 mb-2 ml-2 rounded-md overflow-hidden group">
          <img
            src={
              imageToUpload instanceof Blob
                ? URL.createObjectURL(imageToUpload)
                : null
            }
            alt="hi"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <button
              onClick={handleRemoveImage}
              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transform transition-all duration-200"
            >
              <CloseFile />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center">
        <div>
          <label
            htmlFor="filePicker"
            className="cursor-pointer p-2 text-gray-500 hover:text-blue-500"
          >
            <Plus />
          </label>
          <input
            type="file"
            id="filePicker"
            disabled={imageToUpload}
            hidden
            accept="image/*"
            onChange={handlePickImage}
          />
        </div>
        <div className="flex-1 flex items-center">
          <textarea
            className="flex-1 p-2 outline-none border resize-none overflow-hidden"
            value={text}
            placeholder="Type here..."
            ref={textInputRef}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
            rows={1}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddMessage(e);
              }
            }}
          />
          <button
            type="button"
            onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
          >
            <Smile />
          </button>
          {isEmojiPickerOpen && (
            <div className="absolute bottom-12 right-4 z-10 bg-white border shadow-md rounded">
              <emoji-picker class="dark" ref={emojiPickerRef}></emoji-picker>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Input;
