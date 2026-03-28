import { useForm } from "react-hook-form";
import { editMessage } from "../../../../services/messageDataService";
import { calcTime } from "../../../../utils/messageUtils";
import { useChatContexts } from "../../../../hooks/useContexts";
import { useLongPress } from "../../../../hooks/useLongPress";
import EnlargedImage from "../modals/EnlargedImage";
import { useState } from "react";
import { db } from "../../../../firebase";

const Message = ({
  messageUid,
  memberDataOfSender,
  messageData,
  isEditing,
  changeEditState,
  index,
  currentUserId,
  onMemberContextMenu,
  onMessageContextMenu,
}) => {
  const { register, handleSubmit, resetField } = useForm();
  const { chatState } = useChatContexts();
  const [isPictureEnlarged, setIsPictureEnlarged] = useState(false);

  const messageLongPressHandlers = useLongPress((e) => {
    if (onMessageContextMenu) {
      onMessageContextMenu(e, messageUid, messageData);
    }
  });

  const onSubmitEdit = async ({ editMessageText }) => {
    resetField("editMessage");
    await editMessage(messageUid, editMessageText, chatState.chatID, db);
    await changeEditState(messageUid, false);
  };

  const renderMedia = () => {
    const { fileRef, fileType, fileName } = messageData;
    if (!fileRef) return null;

    if (fileRef === "uploading") {
      return (
        <div className="rounded-md p-3 bg-gray-600 text-white text-center">
          Uploading
        </div>
      );
    }
    if (fileType?.startsWith("image/")) {
      return (
        <div onClick={() => setIsPictureEnlarged(true)}>
          <img className="rounded-md max-w-full h-80" src={fileRef} />
        </div>
      );
    }
    if (fileType?.startsWith("audio/")) {
      return (
        <div className="w-full max-w-md">
          <audio controls className="w-full mt-2 rounded-md">
            <source src={fileRef} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }
    if (fileType?.startsWith("video/")) {
      return <video controls src={fileRef} className="w-full mt-2" />;
    }
    if (fileType === "application/pdf") {
      return (
        <a
          href={fileRef}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-300"
        >
          View PDF: {fileName}
        </a>
      );
    }
    if (fileType?.startsWith("text/")) {
      return (
        <a
          href={fileRef}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-300"
        >
          View Text File: {fileName}
        </a>
      );
    }
  };

  return (
    <>
      {isPictureEnlarged && (
        <EnlargedImage
          imageSrc={messageData.fileRef}
          setIsPictureEnlarged={setIsPictureEnlarged}
        />
      )}

      <div className="group">
        {(messageData.showTimeAndSender || index === 0) && (
          <div className="flex items-center gap-3 mb-2">
            {messageData.sender !== "server" && memberDataOfSender && (
              <div className="flex items-center gap-3">
                <div
                  onContextMenu={(e) =>
                    onMemberContextMenu(
                      e,
                      messageData.sender,
                      memberDataOfSender,
                    )
                  }
                  className="h-10 w-10 rounded-full overflow-hidden cursor-pointer"
                >
                  <img
                    className="h-full w-full object-cover"
                    src={memberDataOfSender.profilePictureURL}
                    alt="profile"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <div>
                    {memberDataOfSender.isBlocked ? (
                      <div className="italic text-sm text-zinc-400">
                        Blocked User
                      </div>
                    ) : (
                      <div className="font-semibold text-zinc-100 flex items-center gap-2">
                        <span>{memberDataOfSender.username}</span>
                        <span className="text-xs text-zinc-400 font-normal">
                          {calcTime(messageData.timestamp)}
                        </span>
                      </div>
                    )}
                    {memberDataOfSender.isRemoved && (
                      <div className="text-xs text-zinc-400">(Removed)</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <input
              placeholder={messageData.text}
              {...register("editMessageText", {
                required: false,
                maxLength: 200,
              })}
              autoFocus
              className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100"
            />
          </form>
        ) : (
          <div
            onContextMenu={(e) =>
              onMessageContextMenu(e, messageUid, messageData)
            }
            {...messageLongPressHandlers}
            className="mt-1"
          >
            {memberDataOfSender && memberDataOfSender.isBlocked ? (
              <div className="italic text-sm font-semibold text-zinc-400">
                Blocked Message
              </div>
            ) : messageData.sender === "server" ? (
              <div className="flex justify-center w-full">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/20 border border-amber-700/30 text-amber-200/90 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="whitespace-pre-wrap">
                    {messageData.text}
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={`inline-block p-3 rounded-lg ${
                  messageData.sender === currentUserId
                    ? "bg-violet-900/40 text-zinc-100 border border-violet-800/30"
                    : "bg-zinc-800 text-zinc-100"
                }`}
              >
                <div className="whitespace-pre-wrap">{messageData.text}</div>
                {messageData.hasBeenEdited && (
                  <div className="text-xs italic text-zinc-400 mt-1">
                    Edited
                  </div>
                )}
                {messageData.fileRef && (
                  <div className="mt-2">{renderMedia()}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
export default Message;
