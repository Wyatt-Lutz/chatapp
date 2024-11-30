import { endAt, startAt, orderByChild, ref, get } from "firebase/database";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { db } from "../../../../firebase";
import { ChatContext } from "../../../providers/ChatProvider";
import { queryMessages } from "../../../services/searchDataService";
import { calcTime } from "../../../services/messageDataService";

const Search = () => {
  const { register, watch } = useForm();
  const searchQuery = watch('searchQuery', '');
  const { data } = useContext(ChatContext);
  const [searchedMessages, setSearchedMessages] = useState([]);

  useEffect(() => {
    if (!searchQuery) {
      return;
    }
    const fetchMessagesWithQuery = async() => {
      const messagesObject = await queryMessages(db, data.chatID, searchQuery);
      const messagesArray = Object.keys(messagesObject).map(key => ({
        id: key,
        ...messagesObject[key],
      }));
      setSearchedMessages(messagesArray);
    }
    fetchMessagesWithQuery();
  }, [searchQuery]);

  const fetchUsername = (message) => {
    const memberObjOfSender = data.members.find(member => member.uid === message.sender);
    return memberObjOfSender;
  }

  return (
    <>
      <input type="text" placeholder="Search messages..." {...register('searchQuery')}/>
      {searchQuery && (
        <div>
          {searchedMessages?.map((message, index) => (
            <>
              <div className="flex">
                <img src="" alt="helllo"/>
                <div>{fetchUsername(message).username}</div>
                <div>{calcTime(message.timestamp)}</div>
              </div>
              <div className="text-wrap">
                <div className="text-xl font-bold py-2 w-max">{message.text}</div>
                {message.hasBeenEdited && (
                  <div>Edited</div>
                )}
              </div>
            </>
          ))}
        </div>
      )}
    </>
  )
}
export default Search;