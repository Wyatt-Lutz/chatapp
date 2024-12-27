import { useContext } from 'react';


import MembersBar from './MembersBar/MembersBar';
import TopBar from './Messages/TopBar';
import Messages from './Messages/Messages';
import Search from './Search';
import { ChatContext } from '../../../providers/ChatContext';

const ChatScreen = () => {
  const { chatRoomData } = useContext(ChatContext);

  return(
    <section>
      {!chatRoomData.chatID ? (
        <div>Chat Requests</div>
      ) : (
        <div key={chatRoomData.chatID}>
          <TopBar />
          <div className='flex'>
            <Messages />
            <div>
              <div>Members:</div>
              <MembersBar/>
            </div>


          </div>
          <Search />
        </div>

      )}
    </section>
  )
}

export default ChatScreen;