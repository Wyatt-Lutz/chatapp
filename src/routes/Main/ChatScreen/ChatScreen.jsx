import { useContext } from 'react';
import Chats from './Chats';
import { ChatContext } from '../../../ChatProvider';


const ChatScreen = () => {
  const { data } = useContext(ChatContext);
  if (!data.chatID) {
    return <div>friends online</div>
  }

  return(
    <section>

      <Chats />

    </section>
  )
}

export default ChatScreen;