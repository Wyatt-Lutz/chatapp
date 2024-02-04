import { BrowserRouter, Routes, Route } from "react-router-dom"
import Signin from "./routes/Signin";
import Signup from "./routes/Signup";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route path="signin" element={<Signin/>}/>
          <Route path="signup" element={<Signup/>}/>
        </Route>
      </Routes>
    </BrowserRouter>


  )
}

export default App
