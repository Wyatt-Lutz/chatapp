import { AuthContext } from '../../providers/AuthProvider';
import ChatScreen from './ChatScreen/ChatScreen';

import { sendEmailVerification, signOut } from 'firebase/auth';
import { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { actionCodeSettings, auth } from '../../../firebase';
import Settings from './Settings/Settings';
import ChatRoomsSideBar from './SideBar/ChatRoomsSideBar/ChatRoomsSideBar';
const EmailNotVerified = lazy(() => import('../../utils/EmailNotVerified'));
const Main = () => {
  const [emailVerificationModal, setEmailVerificationModal] = useState(false);
  const { currUser } = useContext(AuthContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {


    const checkIfUserVerified = async() => {

      const alreadySentVerification = localStorage.getItem('alreadySentVerification');

      if (!auth.currentUser.emailVerified) {
        setEmailVerificationModal(true);

        if (!alreadySentVerification) {
          await sendEmailVerification(currUser, actionCodeSettings);
          localStorage.setItem('alreadySentVerification', true);
          console.info("Email Verification sent");
        }
      } else if (alreadySentVerification) {
        localStorage.removeItem('alreadySentVerification');
      }

      setLoading(false);

    }


    checkIfUserVerified();
  }, [currUser]);


  const signCurrUserOut = () => {
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

      ) : isSettingsOpen ? (
        <Settings />
      ) : loading ? (
        <div>Loading...</div>
      ) : (
        <div className='flex justify-center items-center w-full h-screen'>
          <div className='flex ring flex-col'>
            <ChatRoomsSideBar />
            <div className='flex'>
              <button onClick={() => setIsSettingsOpen(true)} className="ring p-2">Settings</button>
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