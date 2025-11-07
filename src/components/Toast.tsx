import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps extends ToastData {
  onRemove: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onRemove,
}) => {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  return (
    <div
      className={`relative flex items-start gap-3 p-4 rounded-lg border shadow-sm animate-in slide-in-from-right-full ${config.bgColor} ${config.borderColor}`}
    >
      <Icon size={20} className={config.iconColor} />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${config.titleColor}`}>
          {title}
        </p>
        {message && (
          <p className={`text-sm mt-1 ${config.messageColor}`}>
            {message}
          </p>
        )}
      </div>

      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-5 rounded"
      >
        <X size={16} className="text-gray-400" />
      </button>
    </div>
  );
};