import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { AuthContextProvider } from './AuthProvider.jsx';
import { ChatContextProvider } from './ChatProvider.jsx';
//import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

//const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthContextProvider>
    <ChatContextProvider>



        <App />






    </ChatContextProvider>
  </AuthContextProvider>

)
