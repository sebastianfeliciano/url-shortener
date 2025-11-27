import React, { useState, useEffect } from 'react';
import config from '../config';

const Profile = ({ onLoginStateChange }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userUrls, setUserUrls] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Check if user is logged in from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsLoggedIn(true);
      fetchUserUrls(userData.id);
    }
    
    // Check for reset password token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      setShowResetPassword(true);
    }
  }, []);

  const fetchUserUrls = async (profileId) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/profiles/${profileId}/urls`);
      const data = await response.json();
      if (response.ok) {
        setUserUrls(data);
      }
    } catch (err) {
      console.error('Error fetching user URLs:', err);
    }
  };

  const fetchAnalytics = async (profileId) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_BASE_URL}/api/profiles/${profileId}/analytics`);
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
        setShowAnalytics(true);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${config.API_BASE_URL}/api/profiles/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        setError(errorData.error || 'Registration failed');
        setLoading(false);
        return;
      }

      const data = await response.json();

      setUser(data);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(data));
      setUsername('');
      setEmail('');
      setPassword('');
      setIsRegistering(false);
      fetchUserUrls(data.id);
      if (onLoginStateChange) {
        onLoginStateChange(true);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Network error. Please check if the server is running and try again.');
        console.error('Registration error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${config.API_BASE_URL}/api/profiles/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        setError(errorData.error || 'Login failed');
        setLoading(false);
        return;
      }

      const data = await response.json();

      setUser(data);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(data));
      setUsername('');
      setPassword('');
      fetchUserUrls(data.id);
      if (onLoginStateChange) {
        onLoginStateChange(true);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Network error. Please check if the server is running and try again.');
        console.error('Login error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/profiles/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Password reset email sent! Check your inbox.');
        setEmail('');
        setShowForgotPassword(false);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/profiles/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: resetToken, newPassword: newPassword.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Password reset successfully! You can now login.');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
        setShowResetPassword(false);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          setShowForgotPassword(false);
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setUserUrls([]);
    setAnalytics(null);
    setShowAnalytics(false);
    setShowResetPassword(false);
    setShowForgotPassword(false);
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setEmail('');
    setUsername('');
    setPassword('');
    setError('');
    setSuccessMessage('');
    localStorage.removeItem('user');
    
    // Clear URL parameters (like ?token=...) to return to home page
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (onLoginStateChange) {
      onLoginStateChange(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  if (!isLoggedIn) {
    // Reset Password Form
    if (showResetPassword) {
      return (
        <div className="profile-container">
          <h2>Reset Your Password</h2>
          {error && <div className="error">{error}</div>}
          {successMessage && <div className="success" style={{ color: 'green', marginBottom: '20px' }}>{successMessage}</div>}
          <form onSubmit={handleResetPassword} className="auth-section">
            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowResetPassword(false);
                setResetToken('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
              }}
              style={{ marginTop: '10px' }}
            >
              Cancel
            </button>
          </form>
        </div>
      );
    }

    // Forgot Password Form
    if (showForgotPassword) {
      return (
        <div className="profile-container">
          <h2>Forgot Password</h2>
          <p style={{ marginBottom: '20px', opacity: 0.9 }}>Enter your email address and we'll send you a link to reset your password.</p>
          {error && <div className="error">{error}</div>}
          {successMessage && <div className="success" style={{ color: 'green', marginBottom: '20px' }}>{successMessage}</div>}
          <form onSubmit={handleForgotPassword} className="auth-section">
            <div className="form-group">
              <label htmlFor="forgotEmail">Email:</label>
              <input
                type="email"
                id="forgotEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForgotPassword(false);
                setEmail('');
                setError('');
                setSuccessMessage('');
              }}
              style={{ marginTop: '10px' }}
            >
              Back to Login
            </button>
          </form>
        </div>
      );
    }

    // Login/Register Form
    return (
      <div className="profile-container">
        <h2>Welcome to URL Shortener</h2>
        <p style={{ marginBottom: '30px', opacity: 0.9 }}>Please sign in or create an account to get started</p>
        <div className="auth-section">
          <div className="auth-tabs">
            <button
              className={!isRegistering ? 'active' : ''}
              onClick={() => {
                setIsRegistering(false);
                setError('');
                setSuccessMessage('');
              }}
            >
              Sign In
            </button>
            <button
              className={isRegistering ? 'active' : ''}
              onClick={() => {
                setIsRegistering(true);
                setError('');
                setSuccessMessage('');
              }}
            >
              Sign Up
            </button>
          </div>

          {error && <div className="error">{error}</div>}
          {successMessage && <div className="success" style={{ color: 'green', marginBottom: '20px' }}>{successMessage}</div>}

          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegistering ? "At least 6 characters" : "Enter your password"}
                required
                minLength={isRegistering ? 6 : 1}
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Processing...' : isRegistering ? 'Sign Up' : 'Sign In'}
            </button>
            {!isRegistering && (
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setError('');
                  setSuccessMessage('');
                }}
                style={{
                  marginTop: '15px',
                  background: 'none',
                  border: 'none',
                  color: '#6f42c1',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '14px'
                }}
              >
                Forgot Password?
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>👤 Welcome, {user.username}!</h2>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>Total URLs</h3>
          <p className="stat-number">{userUrls.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Clicks</h3>
          <p className="stat-number">
            {userUrls.reduce((sum, url) => sum + (url.clickCount || 0), 0)}
          </p>
        </div>
      </div>

      <div className="profile-actions">
        <button
          onClick={() => fetchAnalytics(user.id)}
          className="btn"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'View Analytics'}
        </button>
      </div>

      {showAnalytics && analytics && (
        <div className="analytics-section">
          <h3>📊 Your Analytics</h3>
          <div className="analytics-summary">
            <p><strong>Total URLs:</strong> {analytics.totalUrls}</p>
            <p><strong>Total Clicks:</strong> {analytics.totalClicks}</p>
          </div>
        </div>
      )}

      <div className="user-urls-section">
        <h3>🔗 Your Shortened URLs</h3>
        {userUrls.length === 0 ? (
          <p className="no-urls">You haven't created any URLs yet. Start shortening URLs while logged in!</p>
        ) : (
          <div className="urls-list">
            {userUrls.map((url) => (
              <div key={url.shortUrl} className="url-card">
                <div className="url-info">
                  <div className="url-row">
                    <strong>Short URL:</strong>
                    <div className="url-display">
                      {config.SHORT_URL_BASE}/{url.shortUrl}
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(`${config.SHORT_URL_BASE}/${url.shortUrl}`)}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="url-row">
                    <strong>Original URL:</strong>
                    <span className="long-url">{url.longUrl}</span>
                  </div>
                  <div className="url-row">
                    <strong>Clicks:</strong> {url.clickCount || 0}
                  </div>
                  <div className="url-row">
                    <strong>Created:</strong> {new Date(url.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {url.qrCode && (
                  <div className="qr-code-section">
                    <img src={url.qrCode} alt="QR Code" className="qr-code-image" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

