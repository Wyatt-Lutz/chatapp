import { endAt, startAt, orderByChild, ref, get } from "firebase/database";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { db } from "../../../../firebase";
import { queryMessages } from "../../../services/searchDataService";
import { calcTime } from "../../../services/messageDataService";
import { MembersContext } from "../../../providers/MembersContext";
import { ChatContext } from "../../../providers/ChatContext";

const Search = () => {
  const { register, watch } = useForm();
  const searchQuery = watch('searchQuery', '');
  const { chatRoomData } = useContext(ChatContext);
  const {membersData} = useContext(MembersContext);
  const [searchedMessages, setSearchedMessages] = useState([]);

  useEffect(() => {
    if (!searchQuery) {
      return;
    }
    const fetchMessagesWithQuery = async() => {
      const messagesObject = await queryMessages(db, chatRoomData.chatID, searchQuery);
      console.log("uisng object.keys: " + messagesObject);
      const messagesArray = Object.keys(messagesObject).map(key => ({
        id: key,
        ...messagesObject[key],
      }));
      setSearchedMessages(messagesArray);
    }
    fetchMessagesWithQuery();
  }, [searchQuery, chatRoomData.chatID]);

  const fetchUsername = (message) => {
    const memberObjOfSender = membersData.members[message.sender];
    return memberObjOfSender.username;
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
                <div>{fetchUsername(message)}</div>
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