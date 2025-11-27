import React, { useState, useEffect } from 'react';
import config from '../config';

const Profile = ({ onLoginStateChange }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
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
        body: JSON.stringify({ username, password }),
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
        body: JSON.stringify({ username, password }),
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setUserUrls([]);
    setAnalytics(null);
    setShowAnalytics(false);
    localStorage.removeItem('user');
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
              }}
            >
              Sign In
            </button>
            <button
              className={isRegistering ? 'active' : ''}
              onClick={() => {
                setIsRegistering(true);
                setError('');
              }}
            >
              Sign Up
            </button>
          </div>

          {error && <div className="error">{error}</div>}

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

