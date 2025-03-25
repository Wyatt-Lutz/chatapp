import MembersBar from './MembersBar/MembersBar';
import TopBar from './Ancillary/TopBar';
import Messages from './Messages/Messages';
import Search from './Ancillary/Search';
import useChatContexts from '../../../hooks/useContexts';

const ChatScreen = () => {
  const { chatState } = useChatContexts();
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
