import UserBar from "./UserBar";
import ChatRoomsSideBar from "./ChatRoomsSideBar/ChatRoomsSideBar";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../../../firebase";
import { useEffect } from "react";
const SideBar = () => {
  const url = useRef('');


  useEffect(() => {
    const getImage = async() => {
      const imagesRef = ref(storage, 'users/kingmancho.jpg');
      console.log(imagesRef);
      const imageURL = await getDownloadURL(imagesRef);
      url.current = imageURL;
      console.log(url.current);

    }
    getImage();
  }, []);



  return(
    <section>
      <ChatRoomsSideBar />
      <UserBar />
      <img src={url.current} />
    </section>

  )
}
export default SideBar;