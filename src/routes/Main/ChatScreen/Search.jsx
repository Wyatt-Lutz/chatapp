import { endAt, startAt, orderByChild, ref, get } from "firebase/database";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { db } from "../../../../firebase";
import { queryMessages } from "../../../services/searchDataService";
import { calcTime } from "../../../services/messageDataService";
import { MembersContext } from "../../../providers/MembersContext";
import { ChatContext } from "../../../providers/ChatContext";
import Message from "./Messages/Message";

const Search = () => {
  const { register, watch } = useForm();
  const searchQuery = watch('searchQuery', '');
  const { chatRoomData } = useContext(ChatContext);
  const { membersData } = useContext(MembersContext);
  const [searchedMessages, setSearchedMessages] = useState([]);

  useEffect(() => {

    if (!searchQuery) {
      return;
    }
    const fetchMessagess = async() => {
      const messagesObject = await queryMessages(db, chatRoomData.chatID, searchQuery);
      console.log("uisng object.keys: " + messagesObject);
      const messagesArray = Object.keys(messagesObject).map(key => ({
        id: key,
        ...messagesObject[key],
      }));
      setSearchedMessages(messagesArray);
    }
    fetchMessagess();

  }, [searchQuery, chatRoomData.chatID]);

  return (
    <>
      <input type="text" placeholder="Search messages..." {...register('searchQuery')}/>
      {searchQuery && (
        <div>
          {searchedMessages?.map((message, index) => (
            <div className="flex">
              <Message />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
export default Search;