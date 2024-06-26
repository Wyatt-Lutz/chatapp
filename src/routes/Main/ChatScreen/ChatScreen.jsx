import { useContext } from 'react';
import { ChatContext } from '../../../ChatProvider';


import MembersBar from './MembersBar/MembersBar';
import TopBar from './Messages/TopBar';
import Messages from './Messages/Messages';

const ChatScreen = () => {
  const { data } = useContext(ChatContext);

  return(
    <section>
      {!data.chatID ? (
        <div>Chat Requests</div>
      ) : (
        <>
          <TopBar />
          <div className='flex'>
            <Messages />
            <div>
              <div>Members:</div>
              <MembersBar/>
            </div>

          </div>
        </>

      )}
    </section>
  )
}

export default ChatScreen;