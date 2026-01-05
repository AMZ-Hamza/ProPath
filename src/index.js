import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App.jsx';

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // If root is missing, log an error (helps debugging)
  console.error('Root element with id="root" not found.');
}
