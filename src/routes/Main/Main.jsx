import ChatScreen from './ChatScreen/ChatScreen';
import { AuthContext } from '../../AuthProvider';
import SideBar from './SideBar/SideBar';
import EmailNotVerified from '../../utils/EmailNotVerified';
import { useEffect, useState, useContext } from 'react';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../../../firebase';
const Main = () => {
  const [isVerify, setVerify] = useState(false);
  const { currUser } = useContext(AuthContext);

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

  const signUserOut = () => {
    signOut(auth).then(() => {
      console.info("Sign out successful")
    }).catch((error) => {
      console.error(error);
    });
  }



  return (
    <section>
      <button onClick={signUserOut} className='text-white font-bold shadow-2xl hover:bg-blue-500 focus:outline-none active:bg-blue-800 bg-blue-400 rounded-lg'>Signout</button>
      {isVerify ? (
        <EmailNotVerified verifyChange={handleVerifyChange} email={currUser.email} />
      ) : (
        <div className='flex justify-center items-center w-full h-screen'>
          <div className='flex ring flex-col'>
            <SideBar />
          </div>
          <ChatScreen />
        </div>
      )}


    </section>

  )
}

export default Main;