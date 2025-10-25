import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import Dashboard from './Dashboard.tsx'
import { ToastProvider } from '../../components/Toast/ToastProvider.tsx';
import { ToastContainer } from '../../components/Toast/ToastContainer.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <Dashboard />
      <ToastContainer />
    </ToastProvider>
  </StrictMode>,
)
