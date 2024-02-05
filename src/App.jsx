import { BrowserRouter, Routes, Route } from "react-router-dom"
import Signin from "./routes/Signin/Signin";
import Signup from "./routes/Signup/Signup";
import Main from "./routes/Main";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

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
      <Routes>
        <Route path="/">
          <Route index element={<AuthProtected><Main /></AuthProtected>}></Route>
          <Route path="signin" element={<Signin/>}/>
          <Route path="signup" element={<Signup/>}/>
        </Route>
      </Routes>
    </BrowserRouter>


  )
}

export default App
