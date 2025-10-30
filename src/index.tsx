
import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Explicitly import from './App.tsx' to resolve the module not found error.
import App from './App';

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
