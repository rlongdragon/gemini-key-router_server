import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Management from './Management'
import '../../index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Management />
  </StrictMode>,
)