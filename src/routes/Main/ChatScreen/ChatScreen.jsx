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
        <>
          <Chats />
          <MembersBar />
        </>

      )}



    </section>
  )
}

export default ChatScreen;