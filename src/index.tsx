import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// 🔥 Registro manual del Service Worker de Firebase
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('✅ Firebase Service Worker registrado:', registration);
    })
    .catch((err) => {
      console.error('❌ Error al registrar Firebase Service Worker:', err);
    });
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>

      <App />
      </SnackbarProvider>

    </BrowserRouter>
  </React.StrictMode>
);
