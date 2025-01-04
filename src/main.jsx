import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { AuthContextProvider } from './providers/AuthProvider.jsx';
import { ChatContextProvider } from './providers/ChatContext.jsx';
import { ChatroomsContextProvider } from './providers/ChatroomsContext.jsx';

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
