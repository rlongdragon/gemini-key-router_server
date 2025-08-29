import React from 'react';
import { useToast } from './useToast';
import styles from './Toast.module.css';

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};