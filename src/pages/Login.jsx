import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../services/api';
import { setSession } from '../utils/auth';
import { Shield, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Guarantee error is cleared on initial mount / page load
  useEffect(() => {
    setError('');
  }, []);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Execute authentication call against backend: POST /api/auth/login
      const response = await loginApi({ username, password });
      
      // Store JWT token and session details in LocalStorage
      setSession(response.data);

      // Redirect to main dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid credentials or backend server is unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-page">
      {/* Left Panel: Enterprise Branding & System Summary (45% Width) */}
      <div className="login-left-panel">
        <div className="login-brand-header">
          <div className="login-brand-logo">
            <Shield size={22} />
          </div>
          <span className="login-brand-title">MAT SYSTEM</span>
        </div>

        <div className="login-left-content">
          <h1 className="login-main-heading">Military Asset Management System</h1>
          <p className="login-supporting-text">
            Manage inventory, asset movements, assignments, expenditures, and military bases from one secure platform.
          </p>

          <div className="login-feature-list">
            <div className="login-feature-item">
              <span className="login-feature-check">✓</span>
              <span>Secure access</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-check">✓</span>
              <span>Role-based permissions</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-check">✓</span>
              <span>Real-time asset tracking</span>
            </div>
          </div>
        </div>

        <div className="login-left-footer">
          MAT • Military Asset Tracker
        </div>
      </div>

      {/* Right Panel: Clean Form Entry (55% Width) */}
      <div className="login-right-panel">
        <div className="login-form-container">
          <h2 className="login-form-heading">Authorized Access</h2>
          <p className="login-form-subtitle">Sign in to access the Military Asset Tracker</p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ width: '100%', paddingRight: '40px' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '42px', fontSize: '0.9rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="login-notice-box">
            <Lock size={16} style={{ minWidth: '16px', color: '#64748b', marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                Authorized Access Only
              </strong>
              This portal is restricted to authorized personnel. Access is controlled according to your assigned role and permissions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
