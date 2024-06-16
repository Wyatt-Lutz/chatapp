import { BrowserRouter, Routes, Route } from "react-router-dom"

import Signin from "./routes/Signin/Signin";
import { Navigate } from "react-router-dom";
import { Suspense, lazy, useContext } from "react";
import { AuthContext } from "./AuthProvider";

const Signup = lazy(() => import('./routes/Signup/Signup'));
const Main = lazy(() => import('./routes/Main/Main'));
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
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/">
            <Route index element={<AuthProtected><Main /></AuthProtected>}></Route>
            <Route path="signin" element={<Signin/>}/>
            <Route path="signup" element={<Signup/>}/>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>


  )
}

export default App
