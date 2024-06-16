import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { AuthContextProvider } from './AuthProvider.jsx';
import { ChatContextProvider } from './ChatProvider.jsx';



ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthContextProvider>
    <ChatContextProvider>
        <App />
    </ChatContextProvider>
  </AuthContextProvider>

)
