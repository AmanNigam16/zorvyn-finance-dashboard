import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Footer, Navbar, Sidebar } from './components';
import { Dashboard, Transactions, Users } from './pages';
import './App.css';

import { useStateContext } from './contexts/ContextProvider';

const App = () => {
  const { currentMode, activeMenu } = useStateContext();

  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
      <BrowserRouter>
        <div className="flex min-h-screen relative">
          <div className={activeMenu ? 'w-72 fixed sidebar bg-white/95 backdrop-blur-sm border-r border-slate-200' : 'w-0'}>
            <Sidebar />
          </div>
          <div
            className={
              activeMenu
                ? 'w-full min-h-screen md:ml-72'
                : 'w-full min-h-screen'
            }
          >
            <div className="sticky top-0 z-40 navbar border-b border-slate-200 bg-white/80 backdrop-blur-sm">
              <Navbar />
            </div>
            <div className="px-4 pb-6 md:px-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/users" element={<Users />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
