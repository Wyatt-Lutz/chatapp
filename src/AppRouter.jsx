import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./pages/Signin/Signin";
import { Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { useAuth } from "./context/providers/AuthContext";
import PageNotFound from "./pages/PageNotFound";

const EmailNotVerified = lazy(() => import("./components/EmailNotVerified"));
const Signup = lazy(() => import("./pages/Signup/Signup"));
const Main = lazy(() => import("./pages/Home/Home"));
const Settings = lazy(() => import("./pages/Settings/Settings"));

function AppRouter() {
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
      return (
        <div className="min-h-screen w-full bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Loading app
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Please wait while we prepare your chats.
            </p>
          </div>
        </div>
      );
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
      <Suspense
        fallback={
          <div className="min-h-screen w-full bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md animate-pulse">
                <span className="text-xl font-bold">C</span>
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight">
                Loading app
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Please wait while we prepare your chats.
              </p>
            </div>
          </div>
        }
      >
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
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
