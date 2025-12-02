import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/styles/design-system.css';

// UNREGISTER Service Worker (from old project)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((success) => {
        if (success) {
          console.log('✅ Service Worker unregistered successfully');
        }
      });
    }
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
