/* eslint-disable import/first */
// Suppress ResizeObserver error - MUST BE BEFORE ANY IMPORTS
// This error is benign and caused by browser timing issues
const resizeObserverError = (e) => {
  if (e.message?.includes?.('ResizeObserver loop') || 
      e.error?.message?.includes?.('ResizeObserver loop')) {
    const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
    const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
    if (resizeObserverErrDiv) resizeObserverErrDiv.style.display = 'none';
    if (resizeObserverErr) resizeObserverErr.style.display = 'none';
    e.stopImmediatePropagation?.();
    e.preventDefault?.();
    return true;
  }
};
window.addEventListener('error', resizeObserverError, true);
window.addEventListener('unhandledrejection', resizeObserverError, true);

// Override window.onerror as backup
const originalOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (message?.includes?.('ResizeObserver loop')) {
    return true;
  }
  if (originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
  return false;
};

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();