// src/main.jsx
import React from 'react';
import App from './App';
import { createRoot } from 'react-dom/client';
import { AppKitProvider } from './AppKitProvider';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ExplorePixx from './page/ExplorePixx';
import Investmentdetail from './page/Investmentdetail';
import Account from './page/Account';
import Portfolio from './page/Portfolio';
import AssetDetail from './page/AssetDetail';
import { Toaster } from 'react-hot-toast';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AppKitProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/explore-pixx" element={<ExplorePixx />} />
          <Route path="/investment-detail" element={<Investmentdetail />} />
          <Route path="/account" element={<Account />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/asset-detail" element={<AssetDetail />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px',
          },
          success: {
            duration: 3000,
            style: {
              background: 'green',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: 'red',
            },
          },
        }}
      />
    </AppKitProvider>
  </React.StrictMode>
);