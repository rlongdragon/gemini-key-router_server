import { useContext } from 'react';
import { ToastContext } from './ToastContext';
import type { ToastContextType } from './ToastContext';

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};