import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

const GOOGLE_CLIENT_ID = "616801931326-t7stg0k0v8n2n06a3n801i83b06l165n.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
