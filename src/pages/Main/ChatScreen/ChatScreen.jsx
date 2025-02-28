import { useContext } from 'react';


import MembersBar from './MembersBar/MembersBar';
import TopBar from './TopBar';
import Messages from './Messages/Messages';
import Search from './Search';
import { ChatContext } from '../../../context/ChatContext';

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

            <Search />

          </div>

        </>

      )}
    </section>
  )
}

export default ChatScreen;