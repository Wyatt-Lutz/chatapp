import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {
  const [currUser, setCurrUser] = useState({});
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const authState = onAuthStateChanged(auth, async (user) => {
      setCurrUser(user);
      setLoadingAuth(false);
    });

    return () => {
      authState();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currUser, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
