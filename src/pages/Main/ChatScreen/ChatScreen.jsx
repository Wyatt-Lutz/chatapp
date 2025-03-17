import { useContext } from 'react';


import MembersBar from './MembersBar/MembersBar';
import TopBar from './Ancillary/TopBar';
import Messages from './Messages/Messages';
import Search from './Ancillary/Search';
import { ChatContext } from '../../../context/ChatContext';

const ChatScreen = () => {
  const { chatState } = useContext(ChatContext);
  return(
    <section>
      {!chatState.chatID ? (
        <div>Hello</div>
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