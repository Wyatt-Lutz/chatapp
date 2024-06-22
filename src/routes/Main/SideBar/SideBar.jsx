import UserBar from "./UserBar";
import ChatRoomsSideBar from "./ChatRoomsSideBar/ChatRoomsSideBar";
const SideBar = () => {
  return(
    <section>
      <ChatRoomsSideBar />
      <UserBar />
    </section>

  )
}
export default SideBar;