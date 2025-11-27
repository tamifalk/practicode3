// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // חשוב ב־React 18
import { BrowserRouter as Router } from "react-router-dom";
import App from './App';
import './style.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
