import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../utils/auth';
import * as api from '../utils/api';
import '../styles/header.css';

export function Header() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">🚀 ChatFree</h1>
      </div>

      <div className="header-right">
        <div className="user-menu">
          <button
            className="user-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title={`Logged in as ${user.username}`}
          >
            <span className="user-avatar">{user.username[0].toUpperCase()}</span>
            <span className="user-name">{user.username}</span>
            <span className="dropdown-icon">▼</span>
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <p className="dropdown-email">{user.email}</p>
              </div>
              <hr className="dropdown-divider" />
              <button
                className="dropdown-item"
                onClick={() => {
                  navigate('/profile');
                  setIsDropdownOpen(false);
                }}
              >
                👤 Profile Settings
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  navigate('/preferences');
                  setIsDropdownOpen(false);
                }}
              >
                ⚙️ Preferences
              </button>
              <hr className="dropdown-divider" />
              <button
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
