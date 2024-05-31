import ChatScreen from './ChatScreen/ChatScreen';
import Chats from './ChatScreen/Chats';

import SideBar from './SideBar/SideBar';

const Main = () => {
  return (
    <section className='flex justify-center items-center w-full h-screen'>
      <div className='flex ring flex-col'>
        <SideBar />

      </div>
      <Chats />


    </section>

  )
}

export default Main;