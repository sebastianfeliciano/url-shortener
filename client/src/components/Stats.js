import React, { useState, useEffect } from 'react';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2>📊 System Statistics</h2>
      <p>Real-time statistics for the URL shortener service</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalUrls}</h3>
          <p>Total URLs Created</p>
        </div>
        
        <div className="stat-card">
          <h3>{stats.totalClicks}</h3>
          <p>Total Redirects</p>
        </div>
        
        <div className="stat-card">
          <h3>{stats.cacheSize}</h3>
          <p>Cache Entries</p>
        </div>
        
        <div className="stat-card">
          <h3>⚡</h3>
          <p>Low Latency</p>
        </div>
      </div>

      <div className="analytics-card" style={{ marginTop: '2rem' }}>
        <h3>🚀 Performance Features</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e1e5e9' }}>
            <strong>LRU Cache:</strong> Fast URL lookups with intelligent caching
          </li>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e1e5e9' }}>
            <strong>MongoDB:</strong> Scalable NoSQL database for URL storage
          </li>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e1e5e9' }}>
            <strong>Analytics:</strong> Real-time click tracking and redirect time monitoring
          </li>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e1e5e9' }}>
            <strong>QR Codes:</strong> Automatic QR code generation for easy sharing
          </li>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e1e5e9' }}>
            <strong>Rate Limiting:</strong> Protection against abuse and spam
          </li>
          <li style={{ padding: '0.5rem 0' }}>
            <strong>Security:</strong> Helmet.js for security headers and CORS protection
          </li>
        </ul>
      </div>

      <div className="analytics-card" style={{ marginTop: '1rem' }}>
        <h3>🔧 API Endpoints</h3>
        <div style={{ fontFamily: 'Courier New, monospace', fontSize: '0.9rem' }}>
          <p><strong>POST /api/create</strong> - Create a new short URL</p>
          <p><strong>GET /:shortUrl</strong> - Redirect to original URL (301)</p>
          <p><strong>GET /api/analytics/:shortUrl</strong> - Get analytics for a URL</p>
          <p><strong>GET /api/stats</strong> - Get system statistics</p>
          <p><strong>GET /api/health</strong> - Health check endpoint</p>
        </div>
      </div>
    </div>
  );
};

export default Stats;
