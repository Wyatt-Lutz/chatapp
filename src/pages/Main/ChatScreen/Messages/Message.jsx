import { useForm } from "react-hook-form";
import { db } from "../../../../../firebase";
import { editMessage } from "../../../../services/messageDataService";
import { calcTime } from "../../../../utils/messageUtils";
import { useChatContexts } from "../../../../hooks/useContexts";
import EnlargedImage from "../modals/EnlargedImage";
import { useState } from "react";

const Message = ({
  messageUid,
  memberDataOfSender,
  messageData,
  isEditing,
  changeEditState,
  index,
  onMemberContextMenu,
  onMessageContextMenu,
}) => {
  const { register, handleSubmit, resetField } = useForm();
  const { chatState } = useChatContexts();
  const [isPictureEnlarged, setIsPictureEnlarged] = useState(false);

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
      <div className="hover:bg-gray-600 rounded-lg pt-2 pb-2">
        {(messageData.renderTimeAndSender || index === 0) && (
          <div className="flex items-center gap-2">
            {messageData.sender !== "server" && (
              <div
                onContextMenu={(e) =>
                  onMemberContextMenu(e, messageData.sender, memberDataOfSender)
                }
              >
                {memberDataOfSender && (
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img
                        className="h-full w-full object-cover"
                        src={memberDataOfSender.profilePictureURL}
                        alt="profile picture"
                      />
                    </div>

                    {memberDataOfSender.isBlocked ? (
                      <div>Blocked User</div>
                    ) : (
                      <div className="font-semibold text-xl">
                        {memberDataOfSender && memberDataOfSender.username}
                      </div>
                    )}
                    {memberDataOfSender.isRemoved && (
                      <div> (Removed user) </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="flex">{calcTime(messageData.timestamp)}</div>
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
            />
          </form>
        ) : (
          <div
            onContextMenu={(e) =>
              onMessageContextMenu(e, messageUid, messageData)
            }
            className="mt-1"
          >
            {memberDataOfSender && memberDataOfSender.isBlocked ? (
              <div className="italic text-xl font-bold py-2 w-max">
                Blocked Message
              </div>
            ) : (
              <div>
                <div className="flex w-max font-bold">
                  <div className="text-xl whitespace-pre-wrap">
                    {messageData.text}
                  </div>
                  {messageData.hasBeenEdited && (
                    <div className="text-xs italic text-gray-800 ">Edited</div>
                  )}
                </div>
                {renderMedia()}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
export default Message;
