import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";


export const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {
  const [currUser, setCurrUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authState = onAuthStateChanged(auth, (user) => {
      setCurrUser(user);
      setLoading(false);
      console.info('authstate listener subscribe');
    });
    return () => {
      authState();
      console.info('auth state listener unsubscribe');
    };
  }, []);

  if (loading) {
    return <div>...</div>
  }

  return(
    <AuthContext.Provider value={{ currUser }}>
      {children}
    </AuthContext.Provider>
  )
};




