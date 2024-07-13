import { AuthContext } from '../../AuthProvider';
import ChatScreen from './ChatScreen/ChatScreen';

import { sendEmailVerification, signOut } from 'firebase/auth';
import { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { auth } from '../../../firebase';
import Settings from './Settings/Settings';
import ChatRoomsSideBar from './SideBar/ChatRoomsSideBar/ChatRoomsSideBar';
const EmailNotVerified = lazy(() => import('../../utils/EmailNotVerified'));
const Main = () => {
  const [isVerify, setVerify] = useState(false);
  const { currUser } = useContext(AuthContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {

    const checkIfUserVerified = async() => {
      if (!auth.currentUser.emailVerified) {
        await sendEmailVerification(currUser);
        console.info("Email Verification sent");
        setVerify(true);
      }
    }

    checkIfUserVerified();
  }, [currUser]);

  const handleVerifyChange = (state) => {
    setVerify(state);
  }

  const signCurrUserOut = () => {
    signOut(auth).then(() => {
      console.info("Sign out successful")
    }).catch((error) => {
      console.error(error);
    });
  }



  return (

    <section>
      {isVerify ? (
        <Suspense fallback={<div>Loading...</div>}>
          <EmailNotVerified verifyChange={handleVerifyChange} email={currUser.email} />
        </Suspense>

      ) : isSettingsOpen ? (
        <Settings />
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