import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom'; // Ajoute cette ligne

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* Enveloppe <App /> dans <BrowserRouter> */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
