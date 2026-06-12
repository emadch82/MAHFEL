
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// --- Service Worker Registration ---
// In sandboxed preview environments, absolute paths or certain relative paths can resolve 
// to the tool's domain (e.g., ai.studio) instead of the sandbox origin, causing errors.
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
    } else {
      navigator.serviceWorker.register('./service-worker.js', { scope: './' })
        .then(registration => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch(error => {
          const isOriginError = error.message.includes('origin') || error.name === 'SecurityError';

          if (isOriginError) {
            return;
          }
          console.warn('Service Worker registration failed:', error.message || error);
        });
    }
  }
});
