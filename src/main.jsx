import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { MemberContextProvider } from "./context/providers/MemberContext.jsx";
import { MessageContextProvider } from "./context/providers/MessageContext.jsx";
import { AuthContextProvider } from "./context/providers/AuthContext.jsx";
import { ChatroomsContextProvider } from "./context/providers/ChatroomsContext.jsx";
import { ChatContextProvider } from "./context/providers/ChatContext.jsx";

const Providers = ({ children }) => (
  <AuthContextProvider>
    <ChatroomsContextProvider>
      <ChatContextProvider>
        <MemberContextProvider>
          <MessageContextProvider>{children}</MessageContextProvider>
        </MemberContextProvider>
      </ChatContextProvider>
    </ChatroomsContextProvider>
  </AuthContextProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
