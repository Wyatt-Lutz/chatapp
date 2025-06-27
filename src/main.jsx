import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { MemberContextProvider } from "./context/providers/MemberContext.jsx";
import { MessageContextProvider } from "./context/providers/MessageContext.jsx";
import { AuthContextProvider } from "./context/providers/AuthContext.jsx";
import { ChatroomsContextProvider } from "./context/providers/ChatroomsContext.jsx";
import { ChatContextProvider } from "./context/providers/ChatContext.jsx";
import ChatroomsListenerWrapper from "./context/ChatroomsListenerWrapper.jsx";
import { ErrorBoundary } from "react-error-boundary";
import { GlobalErrorFallback } from "./utils/fallbacks/GlobalErrorFallback.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

const Providers = ({ children }) => (
  <ToastProvider>
    <AuthContextProvider>
      <ChatroomsContextProvider>
        <ChatContextProvider>
          <MemberContextProvider>
            <MessageContextProvider>
              <ChatroomsListenerWrapper>{children}</ChatroomsListenerWrapper>
            </MessageContextProvider>
          </MemberContextProvider>
        </ChatContextProvider>
      </ChatroomsContextProvider>
    </AuthContextProvider>
  </ToastProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Providers>
      <ErrorBoundary
        FallbackComponent={GlobalErrorFallback}
        onReset={() => window.location.reload()}
      >
        <App />
      </ErrorBoundary>
    </Providers>
  </StrictMode>,
);
