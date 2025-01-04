import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { db } from "../../../../firebase";
import { queryMessages } from "../../../services/searchDataService";
import { ChatContext } from "../../../providers/ChatContext";
import Message from "./Messages/Message";

const Search = () => {
  console.log('search run');
  const { register, watch } = useForm();
  const searchQuery = watch('searchQuery', '');
  const { chatState } = useContext(ChatContext);
  const chatID = chatState.chatID;
  const searchedMessages = new Map();
/*
  useEffect(() => {

    if (!searchQuery) {
      return;
    }

    const fetchMessages = async() => {
      const messagesObject = await queryMessages(db, chatID, searchQuery);
      console.log("using object.keys: " + Object.values(messagesObject));
      messages
      searchedMessages.set(messagesObject.key)

      const messageData = []
      snap.forEach((child) => {
        messageData.push(child.val());
      })

      const messagesArray = Object.keys(messagesObject).map(key => ({

      }));


    }
    fetchMessages();

  }, [searchQuery, chatID]);
*/
  return (
    <>
      <input type="text" placeholder="Search messages..." {...register('searchQuery')}/>
      {searchQuery && (
        <div>
          {searchedMessages?.map((message, index) => (
            <div key={message.id} className="flex">
              <Message messageUid={message.id} messageData={message} isFirst={index === 0} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
export default Search;