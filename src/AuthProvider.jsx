import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";


export const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {
  const [currUser, setCurrUser] = useState({});

  useEffect(() => {
    const authState = onAuthStateChanged(auth, (user) => {
      setCurrUser(user);
      console.info('authstate listener subscribe');
    });
    return () => {
      authState();
      console.info('auth state listener unsubscribe');
    };
  }, []);


  return(
    <AuthContext.Provider value={{ currUser }}>
      {children}
    </AuthContext.Provider>
  )
};




