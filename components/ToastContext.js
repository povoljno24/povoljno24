'use client';
import { useState, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[280px] max-w-[400px] p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-300
              ${toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 
                toast.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 
                'bg-white border-gray-100 text-gray-800'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
              ${toast.type === 'error' ? 'bg-red-100 text-red-600' : 
                toast.type === 'success' ? 'bg-green-100 text-green-600' : 
                'bg-[#185FA5] text-white'}`}
            >
              {toast.type === 'error' ? '!' : toast.type === 'success' ? '✓' : 'ℹ'}
            </div>
            <div className="flex-1 text-[13px] font-semibold leading-snug">
              {toast.message}
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
