import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter as سعيد } from 'react-router-dom';

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      {/* <سعيد> */}
        <App />
      {/* </سعيد> */}
    </React.StrictMode>
  );
} else {
  // If root is missing, log an error (helps debugging)
  console.error('Root element with id="root" not found.');
}
