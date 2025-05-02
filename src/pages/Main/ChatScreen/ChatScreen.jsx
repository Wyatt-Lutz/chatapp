import MembersBar from './MembersBar/MembersBar';
import TopBar from './Ancillary/TopBar';
import Messages from './Messages/Messages';
import Search from './Ancillary/Search';
import { useChatContexts } from '../../../hooks/useContexts';

const ChatScreen = () => {
  const { chatState } = useChatContexts();
  return(
    <div>
      {!chatState.chatID ? (
        <div className='flex flex-1 items-center justify-center text-xl'>Start chatting</div>
      ) : (
        <>
          <TopBar />
          <div className='flex'>
            <Messages />

            <MembersBar/>



          </div>

        </>

      )}
    </div>
  )
}

export default ChatScreen;
