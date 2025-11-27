import React, { useState, useEffect } from 'react';
import UrlShortener from './components/UrlShortener';
import Analytics from './components/Analytics';
import Stats from './components/Stats';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setIsLoggedIn(true);
      setActiveTab('shortener'); // Switch to shortener after login
    }
  }, []);

  // Handle login state change from Profile component
  const handleLoginStateChange = (loggedIn) => {
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      setActiveTab('shortener');
    } else {
      setActiveTab('profile');
    }
  };

  // If not logged in, only show Profile/login
  if (!isLoggedIn) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>URL Shortener</h1>
          <p className="welcome-message">Please sign in or sign up to continue</p>
        </header>
        <main>
          <Profile onLoginStateChange={handleLoginStateChange} />
        </main>
      </div>
    );
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setActiveTab('profile');
  };

  // If logged in, show full navigation
  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Shortener</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <nav>
            <button 
              className={activeTab === 'shortener' ? 'active' : ''}
              onClick={() => setActiveTab('shortener')}
            >
              Shorten URL
            </button>
            <button 
              className={activeTab === 'analytics' ? 'active' : ''}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button 
              className={activeTab === 'stats' ? 'active' : ''}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </button>
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
          </nav>
          <button 
            onClick={handleLogout} 
            className="btn-logout"
            style={{ 
              marginLeft: '20px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '20px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'shortener' && <UrlShortener />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'stats' && <Stats />}
        {activeTab === 'profile' && <Profile onLoginStateChange={handleLoginStateChange} />}
      </main>
    </div>
  );
}

export default App;
