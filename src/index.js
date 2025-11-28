import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Add at the top of src/index.js, after imports
if (typeof window !== 'undefined') {
  const resizeObserverErr = window.onerror;
  window.onerror = (message, ...args) => {
    if (message?.includes?.('ResizeObserver loop')) {
      return true;
    }
    if (resizeObserverErr) {
      return resizeObserverErr(message, ...args);
    }
  };
}

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
