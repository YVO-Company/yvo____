import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'


import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from './context/AuthContext';



import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <App />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
