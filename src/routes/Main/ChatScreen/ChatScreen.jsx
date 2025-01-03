import { useContext } from 'react';


import MembersBar from './MembersBar/MembersBar';
import TopBar from './Messages/TopBar';
import Messages from './Messages/Messages';
import Search from './Search';
import { ChatContext } from '../../../providers/ChatContext';

const ChatScreen = () => {
  console.log('chatScreen run');
  const { chatState } = useContext(ChatContext);
  return(
    <section>
      {!chatState.chatID ? (
        <div>Chat Requests</div>
      ) : (
        <>
          <TopBar />
          <div className='flex'>
            <Messages />
            <>
              <MembersBar/>
            </>


          </div>

        </>

      )}
    </section>
  )
}

export default ChatScreen;