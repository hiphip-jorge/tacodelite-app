import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Start mock service worker in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') {
    import('../mocks/index.js').then(({ worker }) => {
        console.log('🔶 Mock service worker started in development mode');
    }).catch(err => {
        console.log('Mock service worker not available:', err);
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
