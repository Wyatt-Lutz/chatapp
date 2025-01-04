import { BrowserRouter, Routes, Route } from "react-router-dom"

import Signin from "./routes/Signin/Signin";
import { Navigate } from "react-router-dom";
import { Suspense, lazy, useContext } from "react";
import { AuthContext } from "./providers/AuthProvider";

const Signup = lazy(() => import('./routes/Signup/Signup'));
const Main = lazy(() => import('./routes/Main/Main'));
const Settings = lazy(() => import('./routes/Main/Settings/Settings'));

function App() {
  const { currUser } = useContext(AuthContext);

  const AuthProtected = ({ children }) => {

    if (!currUser) {
      return <Navigate to="/signin"/>
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
                <Main />
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

          <Route path="signin" element={<Signin/>}/>
          <Route path="signup" element={<Signup/>}/>


        </Routes>
      </Suspense>
    </BrowserRouter>


  )
}

export default App