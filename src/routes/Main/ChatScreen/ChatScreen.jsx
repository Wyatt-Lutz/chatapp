import { useContext } from 'react';


import MembersBar from './MembersBar/MembersBar';
import TopBar from './Messages/TopBar';
import Messages from './Messages/Messages';
import Search from './Search';
import { ChatContext } from '../../../providers/ChatContext';

const ChatScreen = () => {
  const { currChat } = useContext(ChatContext);
  const chatID = currChat.chatData.chatID
  return(
    <section>
      {!chatID ? (
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
          <Search />
        </>

      )}
    </section>
  )
}

export default ChatScreen;