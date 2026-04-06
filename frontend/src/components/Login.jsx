import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../utils/api';
import { saveAuth } from '../utils/auth';
import '../styles/auth.css';

export function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }

      // Call login API
      const { token, user } = await api.login(formData.email, formData.password);

      // Save token and user to localStorage
      saveAuth(token, user);

      // Redirect to main app
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🚀 ChatFree</h1>
          <p>Unbiased AI Chat with Local LLM</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Login to Your Account</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>

        <div className="auth-info">
          <h3>Demo Credentials</h3>
          <p>Email: <code>demo@example.com</code></p>
          <p>Password: <code>password123</code></p>
          <p className="hint">Or <Link to="/register">create a new account</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
