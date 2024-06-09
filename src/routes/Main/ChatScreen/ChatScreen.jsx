import { useContext } from 'react';
import Chats from './Chats';
import { ChatContext } from '../../../ChatProvider';


const ChatScreen = () => {
  const { data } = useContext(ChatContext);


  return(
    <section>
      {!data.chatID ? (
        <div>firends online YOOOO WASGOOOD</div>
      ) : (
        <Chats />
      )}


    </section>
  )
}

export default ChatScreen;