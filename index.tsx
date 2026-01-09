import { initSentry } from '@/lib/sentry';
import { logger } from '@/utils/logger';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/styles/design-system.css';

// 🛡️ Initialize Sentry error tracking (production only)
initSentry();

// Register PWA service worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        logger.info('✅ Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        logger.error('❌ Service Worker registration failed:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
