import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./pages/Signin/Signin";
import { Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { useAuth } from "./context/providers/AuthContext";

const EmailNotVerified = lazy(() => import("./components/EmailNotVerified"));
const Signup = lazy(() => import("./pages/Signup/Signup"));
const Main = lazy(() => import("./pages/Main/Main"));
const Settings = lazy(() => import("./pages/Settings/Settings"));

function App() {
  const { currUser, loadingAuth } = useAuth();
  const [isVerified, setIsVerified] = useState(true);
  const [loading, setLoading] = useState(true);
  const AuthProtected = ({ children }) => {
    if (!currUser) {
      return <Navigate to="/signin" />;
    }
    return children;
  };

  useEffect(() => {
    if (!currUser) return;
    setIsVerified(currUser.emailVerified);
    setLoading(false);
  }, [currUser]);

  const VerifiedProtected = ({ children }) => {
    if (loading || loadingAuth) {
      return <div>Loading...</div>;
    }
    if (!isVerified) {
      return (
        <EmailNotVerified
          email={currUser?.email}
          setIsVerified={setIsVerified}
        />
      );
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading App...</div>}>
        <Routes>
          <Route
            path="/"
            index
            element={
              <AuthProtected>
                <VerifiedProtected>
                  <Main />
                </VerifiedProtected>
              </AuthProtected>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthProtected>
                <Settings />
              </AuthProtected>
            }
          />

          <Route path="signin" element={<Signin />} />
          <Route path="signup" element={<Signup />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
