import React, { useState } from 'react';
import './App.css';
import UrlShortener from './components/UrlShortener';
import Analytics from './components/Analytics';
import Stats from './components/Stats';

function App() {
  const [activeTab, setActiveTab] = useState('shortener');

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔗 URL Shortener</h1>
        <p>Fast, secure, and analytics-powered URL shortening</p>
      </header>
      
      <nav className="nav-tabs">
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
      </nav>

      <main className="main-content">
        {activeTab === 'shortener' && <UrlShortener />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'stats' && <Stats />}
      </main>
    </div>
  );
}

export default App;