import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Management from './Management';
import '../../index.css';
import { ToastProvider } from '../../components/Toast/ToastProvider';
import { ToastContainer } from '../../components/Toast/ToastContainer';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <Management />
      <ToastContainer />
    </ToastProvider>
  </StrictMode>
);