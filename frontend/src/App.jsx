import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConversationProvider, useConversation } from './contexts/ConversationContext';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import SideBar from './components/SideBar';
import ChatWindow from './components/ChatWindow';
import RightPanel from './components/RightPanel';
import { healthCheck } from './utils/api';
import { isAuthenticated } from './utils/auth';
import './styles/app.css';

function AppContent() {
  const [serverReady, setServerReady] = useState(false);
  const [serverError, setServerError] = useState(null);
  const { isAuthenticated: userAuthenticated } = useConversation();

  useEffect(() => {
    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkServer = async () => {
    try {
      await healthCheck();
      setServerReady(true);
      setServerError(null);
    } catch (error) {
      setServerReady(false);
      setServerError('Backend not available. Make sure you run: npm start in the backend folder');
    }
  };

  if (!serverReady && userAuthenticated) {
    return (
      <div className="error-screen">
        <div className="error-container">
          <h1>⚠️ Server Connection Error</h1>
          <p>{serverError}</p>
          <p className="error-hint">Start the backend with: <code>cd backend && npm install && npm start</code></p>
          <button onClick={checkServer} className="retry-button">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <SideBar />
        <ChatWindow />
        <RightPanel />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ConversationProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown routes to login or home */}
          <Route path="*" element={<Navigate to={isAuthenticated() ? '/' : '/login'} replace />} />
        </Routes>
      </ConversationProvider>
    </BrowserRouter>
  );
}

export default App;
