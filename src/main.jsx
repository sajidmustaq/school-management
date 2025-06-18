import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';   
import { DataProvider } from './context/DataContext';     

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
       <DataProvider>
      <App />
      </DataProvider>
    </AuthProvider>
  </React.StrictMode>
);
