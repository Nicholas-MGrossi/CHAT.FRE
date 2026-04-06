import React, { useEffect, useState } from 'react';
import { ConversationProvider } from './contexts/ConversationContext';
import SideBar from './components/SideBar';
import ChatWindow from './components/ChatWindow';
import RightPanel from './components/RightPanel';
import { healthCheck } from './utils/api';
import './styles/app.css';

function AppContent() {
  const [serverReady, setServerReady] = useState(false);
  const [serverError, setServerError] = useState(null);

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

  if (!serverReady) {
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
      <SideBar />
      <ChatWindow />
      <RightPanel />
    </div>
  );
}

function App() {
  return (
    <ConversationProvider>
      <AppContent />
    </ConversationProvider>
  );
}

export default App;
