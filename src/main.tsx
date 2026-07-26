import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { logger } from '@/lib/logger'
import './index.css'

// Глобальные обработчики ошибок — то, что не успел поймать ErrorBoundary.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Unhandled window error', event.error ?? event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
