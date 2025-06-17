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

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setCurrUser({ ...auth.currentUser });
    }
  };

  return (
    <AuthContext.Provider value={{ currUser, loadingAuth, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
