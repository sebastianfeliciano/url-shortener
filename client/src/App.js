import React, { useState } from 'react';
import UrlShortener from './components/UrlShortener';
import Analytics from './components/Analytics';
import Stats from './components/Stats';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('shortener');

  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Shortener</h1>
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
        </nav>
      </header>

      <main>
        {activeTab === 'shortener' && <UrlShortener />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'stats' && <Stats />}
      </main>
    </div>
  );
}

export default App;
