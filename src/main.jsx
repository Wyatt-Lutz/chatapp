import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { AuthContextProvider } from './providers/AuthProvider.jsx';
import { ChatContextProvider } from './providers/ChatContext.jsx';
import { ChatroomsContextProvider } from './providers/ChatroomsContext.jsx';
import { MembersContextProvider } from './providers/MembersContext.jsx';
import { MessagesContextProvider } from './providers/MessagesContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <ChatroomsContextProvider>
        <ChatContextProvider>
          <>
            <MembersContextProvider>
              <MessagesContextProvider>
                <App />
              </MessagesContextProvider>
            </MembersContextProvider>
          </>

        </ChatContextProvider>
      </ChatroomsContextProvider>
    </AuthContextProvider>
  </StrictMode>


)
