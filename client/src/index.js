import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker with auto-refresh on update
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // New content available - force refresh to get latest code
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload after a short delay to allow SW to activate
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }
});

// Listen for SW update messages (sent during activate)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_UPDATED') {
      console.log('Service worker updated, refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  });
}

// BUILD_VERSION_v4_
