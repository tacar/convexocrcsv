import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastData, ToastType } from '../components/Toast';

interface NotificationContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

const MAX_TOASTS = 3; // 最大表示数

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    setToasts(prev => {
      // 同じタイトルとメッセージの重複チェック
      const isDuplicate = prev.some(toast =>
        toast.title === title && toast.message === message && toast.type === type
      );

      if (isDuplicate) {
        return prev; // 重複の場合は追加しない
      }

      const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const newToast: ToastData = {
        id,
        type,
        title,
        message,
        duration,
      };

      const updatedToasts = [...prev, newToast];
      // 最大表示数を超えた場合、古いトーストを削除
      if (updatedToasts.length > MAX_TOASTS) {
        return updatedToasts.slice(-MAX_TOASTS);
      }
      return updatedToasts;
    });
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast('success', title, message);
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast('error', title, message);
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast('info', title, message);
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast('warning', title, message);
  }, [showToast]);

  const contextValue: NotificationContextType = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};