import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './assets/firebase.css';

import { AuthContextProvider } from './context/AuthContext.jsx';
import { ChatContextProvider } from './context/ChatContext.jsx';
import { ChatroomsContextProvider } from './context/ChatroomsContext.jsx';

const Providers = ({ children }) => (
  <AuthContextProvider>
    <ChatroomsContextProvider>
      <ChatContextProvider>
        {children}
      </ChatContextProvider>
    </ChatroomsContextProvider>
  </AuthContextProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(

  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>


)
