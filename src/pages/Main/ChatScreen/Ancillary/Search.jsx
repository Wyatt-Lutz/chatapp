import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { db } from "../../../../../firebase";
import { queryMessages } from "../../../../services/searchDataService";
import Message from "../Messages/Message";
import { useChatContexts } from "../../../../hooks/useContexts";

const Search = () => {
  const { register, control } = useForm();
  const searchQuery = useWatch({name: 'searchQuery', control});
  const { chatState, memberState } = useChatContexts();
  const chatID = chatState.chatID;
  const [searchedMessages, setSearchedMessages] = useState(new Map());

  useEffect(() => {

    if (!searchQuery) {
      return;
    }

    const fetchMessages = async() => {
      const messagesObject = await queryMessages(db, chatID, searchQuery);
      if (!messagesObject) {
        setSearchedMessages(new Map());

        return;
      }

      const messagesArray = Object.entries(messagesObject);
      console.log(messagesArray);
      setSearchedMessages(new Map(messagesArray));


      searchedMessages.set(messagesObject.key, Object.values(messagesObject));
      [...searchedMessages].map(([messageID, messageData]) => {
        console.log(messageID);
      });
    }
    fetchMessages();

  }, [searchQuery, chatID]);

  return (
    <>
      <input type="text" placeholder="Search messages..." {...register('searchQuery')}/>
      {(searchedMessages && searchedMessages.size > 0) ? (
        <div>
          {[...searchedMessages].map(([messageID, messageData], index) => (
            <div key={messageID} className="">
              <Message messageUid={messageID} memberDataOfSender={memberState.members.get(messageData.sender)} messageData={messageData} isEditing={false} changeEditState={() => {}}/>
            </div>
          ))}
        </div>
      ) : (
        <div>No Results</div>
      )}
    </>
  )
}
export default Search;
