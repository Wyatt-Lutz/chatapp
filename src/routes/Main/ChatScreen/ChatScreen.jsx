import { Fragment, useContext } from 'react';
import Chats from './Chats';
import { ChatContext } from '../../../ChatProvider';
import MembersBar from './MembersBar/MembersBar';

const ChatScreen = () => {
  const { data } = useContext(ChatContext);


  return(
    <section>
      {!data.chatID ? (
        <div>firends online</div>
      ) : (
        <div className='flex'>
          <Chats />
          <div>
            <div>Members:</div>
            <MembersBar />
          </div>

        </div>
      )}
    </section>
  )
}

export default ChatScreen;