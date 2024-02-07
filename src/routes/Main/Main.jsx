import ChatScreen from './ChatScreen/ChatScreen';
import SideBar from './SideBar';
import UserBar from './UserBar'

const Main = () => {
  return (
    <section className='flex justify-center items-center h-screen'>
      <div className='flex ring flex-col'>
        <SideBar />
        <UserBar />
      </div>
      <ChatScreen />


    </section>

  )
}

export default Main;