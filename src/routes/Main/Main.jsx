import ChatScreen from './ChatScreen/ChatScreen';

import SideBar from './SideBar/SideBar';

const Main = () => {
  return (
    <section className='flex justify-center items-center w-full h-screen'>
      <div className='flex ring flex-col'>
        <SideBar />

      </div>
      <ChatScreen />


    </section>

  )
}

export default Main;