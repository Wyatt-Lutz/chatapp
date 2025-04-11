import { db } from "../../../../../firebase";
import { addMessage } from "../../../../services/messageDataService";
import Smile from "../../../../components/ui/Smile";
import Plus from "../../../../components/ui/Plus";
import { calculateRenderTimeAndSender } from "../../../../utils/messageUtils";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useAuth } from "../../../../context/providers/AuthContext";
import { useRef, useState } from "react";
import { compressImage } from "../../../../utils/mediaUtils";



const Input = () => {
  const { currUser } = useAuth();
  const { chatState, messageState, chatDispatch } = useChatContexts();
  const [imageToUpload, setImageToUpload] = useState(null);
  const [text, setText] = useState("");
  const textInputRef = useRef(null);


  const handleAddMessage = async(e) => {
    e.preventDefault();
    setText("");
    const trimmedText = text.trim();
    if (!trimmedText && !imageToUpload) return;
    if (imageToUpload) {
      setImageToUpload(null);
      URL.revokeObjectURL(imageToUpload);
    }
    const messageKeys = Array.from(messageState.messages.keys());
    const lastMessage = messageKeys.length > 0 ? messageState.messages.get(messageKeys[messageKeys.length - 1]) : null;
    const willRenderTimeAndSender = calculateRenderTimeAndSender(lastMessage, currUser.uid);
    await addMessage(trimmedText, chatState.chatID, currUser.uid, db, willRenderTimeAndSender, chatState.firstMessageID, chatDispatch, imageToUpload);
  };

  const handlePickImage = async(e) => {
    const file = e.target.files[0];
    e.target.value = null; //Allows the onChange to trigger again if the user tries to add the same picture to a different message
    if (!file) return;
    console.log(file);
    const compressedImage = await compressImage(file);
    setImageToUpload(compressedImage);
    textInputRef.current?.focus(); //Will refocus the text input so the user doesn't have to reclick the input to send the message
  }

  const handleRemoveImage = () => {
    setImageToUpload(null);
    URL.revokeObjectURL(imageToUpload);
    textInputRef.current?.focus();
  }



  return (
    <div>
      {imageToUpload && (
        <div className="relative w-20 h-20 mb-2 ml-2 rounded-md overflow-hidden group">
          <img src={imageToUpload instanceof Blob ? URL.createObjectURL(imageToUpload) : null} alt="hi" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <button
              onClick={handleRemoveImage}
              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transform transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

      )}




      <div className="flex items-center">
        <div>
          <label htmlFor="filePicker" className="cursor-pointer p-2 text-gray-500 hover:text-blue-500"><Plus /></label>
          <input type="file" id="filePicker" disabled={imageToUpload} hidden accept="image/*" onChange={handlePickImage}/>
        </div>
        <form className="flex-1 flex items-center" onSubmit={handleAddMessage}>
          <input className="flex-1 p-2 outline-none border" value={text} placeholder="Type here..." ref={textInputRef} onChange={(e) => setText(e.target.value)} maxLength={200} />
          <button><Smile /></button>
        </form>



      </div>

    </div>

  )
}
export default Input;
