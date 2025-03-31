import ChatScreen from './ChatScreen/ChatScreen';
import { sendEmailVerification } from 'firebase/auth';
import { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { auth } from '../../../firebase';
import ChatRoomsSideBar from './SideBar/ChatRoomsSideBar/ChatRoomsSideBar';
import { useNavigate } from 'react-router-dom';
import { signUserOut } from '../../utils/userUtils';
import { useChatContexts } from '../../hooks/useContexts';
import { useAuth } from '../../context/providers/AuthContext';
import { ChatroomsContext } from '../../context/providers/ChatroomsContext';


const EmailNotVerified = lazy(() => import('../../components/EmailNotVerified'));
const Main = () => {
  const [emailVerificationModal, setEmailVerificationModal] = useState(false);
  const { currUser } = useAuth();
  const {chatDispatch, memberDispatch, messageDispatch} = useChatContexts();
  const {chatRoomsDispatch} = useContext(ChatroomsContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();



  useEffect(() => {

    const checkIfUserVerified = async() => {
      const verificationCookieId = `verification-${currUser.uid}`
      const alreadySentVerification = localStorage.getItem(verificationCookieId);

      if (!auth.currentUser.emailVerified) {
        setEmailVerificationModal(true);

        if (!alreadySentVerification) {
          await sendEmailVerification(currUser);
          localStorage.setItem(verificationCookieId, true);
          console.info("Email Verification sent");
        }
      } else if (alreadySentVerification) {
        localStorage.removeItem(verificationCookieId);
      }

      setLoading(false);

    }

    checkIfUserVerified();
  }, [currUser]);


  const signCurrUserOut = async() => {

    await signUserOut(auth, chatDispatch, memberDispatch, messageDispatch, chatRoomsDispatch);
  }



  return (

    <section>
      {emailVerificationModal ? (
        <Suspense fallback={<div>Loading...</div>}>
          <EmailNotVerified email={currUser.email} />
        </Suspense>

      ) : loading ? (
        <div>Loading...</div>
      ) : (
        <div className='flex justify-center items-center w-full h-screen'>
          <div className='flex ring flex-col'>
            <ChatRoomsSideBar />
            <div className='flex'>
              <button onClick={() => navigate("/settings")} className="ring p-2">Settings</button>
              <button onClick={signCurrUserOut}>Log Out</button>
            </div>
          </div>
          <ChatScreen />
        </div>
      )}




    </section>

  )
}

export default Main;
