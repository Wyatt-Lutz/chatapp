import { AuthContext } from '../../context/AuthContext';
import ChatScreen from './ChatScreen/ChatScreen';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { auth } from '../../../firebase';
import ChatRoomsSideBar from './SideBar/ChatRoomsSideBar/ChatRoomsSideBar';
import { ChatContext } from '../../context/ChatContext';
import { ChatroomsContext } from '../../context/ChatroomsContext';
import { useNavigate } from 'react-router-dom';


const EmailNotVerified = lazy(() => import('../../components/EmailNotVerified'));
const Main = () => {
  const [emailVerificationModal, setEmailVerificationModal] = useState(false);
  const { currUser } = useContext(AuthContext);
  const {chatDispatch, memberDispatch, messageDispatch} = useContext(ChatContext);
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


  const signCurrUserOut = () => {
    //Reset the context data
    chatDispatch({type: "RESET"});
    memberDispatch({type: "RESET"});
    messageDispatch({type: "RESET"});
    chatRoomsDispatch({type: "RESET"});

    //Firebase sign out
    signOut(auth).then(() => {
      console.info("Sign out successful")
    }).catch((error) => {
      console.error(error);
    });
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