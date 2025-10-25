import { createContext } from 'react';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: Toast['type']) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);