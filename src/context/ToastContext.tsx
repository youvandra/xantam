import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/Notification';
import type { NotificationType } from '../components/Notification';

interface ToastContextType {
  showToast: (type: NotificationType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);

  const showToast = useCallback((type: NotificationType, message: string) => {
    setNotification({ type, message });
  }, []);

  const closeToast = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeToast}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
