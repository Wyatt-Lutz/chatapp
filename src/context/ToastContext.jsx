import { useContext } from "react";
import { useState } from "react";
import { createContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback } from "react";
import { useId } from "react";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = "error", duration = 3000) => {
    const id = Date.now();
    console.log(id);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-1/6 p-4 space-y-2 z-50">
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => (
            <motion.div
              key={id}
              className={`px-8 py-8 rounded shadow text-white ${type === "error" ? "bg-red-500" : "bg-green-500"}`}
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -200 }}
              transition={{ duration: 0.3 }}
              onClick={() =>
                setToasts((prev) => prev.filter((toast) => toast.id !== id))
              }
            >
              {message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
