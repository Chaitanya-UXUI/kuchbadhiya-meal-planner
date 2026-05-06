import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import {registerSW} from 'virtual:pwa-register';

if (registerSW) {
  registerSW({
    onRegistered(sw) {
      console.log('Service Worker registered');
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
