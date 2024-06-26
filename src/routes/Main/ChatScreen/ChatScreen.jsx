import { useContext } from 'react';
import Messages from './Messages/Messages';
import { ChatContext } from '../../../ChatProvider';
import MembersBar from './MembersBar/MembersBar';

const ChatScreen = () => {
  const { data } = useContext(ChatContext);


  return(
    <section>
      {!data.chatID ? (
        <div>Chat Requests</div>
      ) : (
        <div className='flex'>
          <Messages />
          <div>
            <div>Members:</div>
            <MembersBar/>
          </div>

        </div>
      )}
    </section>
  )
}

export default ChatScreen;