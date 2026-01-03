import { useContext, useState, createContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerToast } from "../services/toastService";
import { useCallback } from "react";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = "error", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  useEffect(() => {
    registerToast(showToast);
  }, [showToast]);

  const typeDependentCSS = {
    error: "bg-rose-500/95 border border-rose-400/70 shadow-rose-300/40",
    success:
      "bg-emerald-500/95 border border-emerald-400/70 shadow-emerald-300/40",
    info: "bg-sky-500/95 border border-sky-400/70 shadow-sky-300/40",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-x-2 top-4 sm:top-6 flex flex-col items-center gap-3 sm:gap-2 z-50 pointer-events-none">
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => (
            <motion.div
              key={id}
              className={`pointer-events-auto w-full sm:w-auto max-w-xl px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white shadow-xl backdrop-blur-md ${
                typeDependentCSS[type] || typeDependentCSS.error
              }`}
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={() =>
                setToasts((prev) => prev.filter((toast) => toast.id !== id))
              }
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 text-sm sm:text-base leading-snug">
                  {message}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
