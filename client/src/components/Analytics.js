import React, { useState, useEffect } from 'react';
import config from '../config';

const Analytics = () => {
  const [allUrls, setAllUrls] = useState([]);
  const [filteredUrls, setFilteredUrls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all URLs on component mount
  useEffect(() => {
    fetchAllUrls();
  }, []);

  // Filter URLs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUrls(allUrls);
    } else {
      const filtered = allUrls.filter(url => 
        url.shortUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.longUrl.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUrls(filtered);
    }
  }, [searchTerm, allUrls]);

  const fetchAllUrls = async () => {
    try {
      console.log('Fetching URLs from:', `${config.API_BASE_URL}/api/urls`);
      const response = await fetch(`${config.API_BASE_URL}/api/urls`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        setAllUrls(data);
        console.log('URLs set successfully:', data.length, 'items');
      } else {
        console.error('API error:', data);
        setError('Failed to fetch URLs: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Network error fetching URLs:', err);
      setError('Network error while fetching URLs: ' + err.message);
    }
  };

  const handleUrlClick = async (urlData) => {
    setSelectedUrl(urlData);
    setLoading(true);
    setError('');
    setAnalytics(null);

    try {
      console.log('Fetching analytics for:', urlData.shortUrl);
      const response = await fetch(`${config.API_BASE_URL}/api/analytics/${urlData.shortUrl}`);
      console.log('Analytics response status:', response.status);
      console.log('Analytics response ok:', response.ok);
      
      const data = await response.json();
      console.log('Analytics response data:', data);

      if (response.ok) {
        setAnalytics(data);
        console.log('Analytics set successfully');
      } else {
        console.error('Analytics API error:', data);
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      console.error('Network error fetching analytics:', err);
      setError('Network error. Please try again: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h2>📊 URL Analytics Dashboard</h2>
      
      {/* Search Bar */}
      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label htmlFor="search">🔍 Search URLs:</label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by short code or destination URL..."
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        />
      </div>

      {error && <div className="error">{error}</div>}

      {/* URL List */}
      <div style={{ marginBottom: '30px' }}>
        <h3>📋 All Short URLs ({filteredUrls.length})</h3>
        {filteredUrls.length === 0 ? (
          <p>No URLs found. Create some short URLs first!</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {filteredUrls.map((url, index) => (
              <div 
                key={index}
                className="url-item"
                onClick={() => handleUrlClick(url)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: selectedUrl?.shortUrl === url.shortUrl ? '#e3f2fd' : '#fff'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = selectedUrl?.shortUrl === url.shortUrl ? '#e3f2fd' : '#fff'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <strong style={{ color: '#1976d2' }}>{url.shortUrl}</strong>
                      <span style={{ fontSize: '18px' }}>→</span>
                      <span style={{ color: '#666', fontSize: '14px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {url.longUrl}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#888' }}>
                      <span>👆 {url.clickCount} clicks</span>
                      <span>📅 {formatDate(url.createdAt)}</span>
                      {url.lastAccessed && <span>🕒 Last: {formatDate(url.lastAccessed)}</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', color: '#1976d2' }}>
                    {selectedUrl?.shortUrl === url.shortUrl ? '▼' : '▶'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Analytics */}
      {selectedUrl && (
        <div style={{ borderTop: '2px solid #1976d2', paddingTop: '20px' }}>
          <h3>📈 Detailed Analytics for {selectedUrl.shortUrl}</h3>
          
          {loading && <p>Loading analytics...</p>}
          
          {analytics && (
            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>🔗 URL Information</h4>
                <p><strong>Short URL:</strong> {analytics.shortUrl}</p>
                <p><strong>Long URL:</strong> 
                  <a href={analytics.longUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '5px', color: '#1976d2' }}>
                    {analytics.longUrl}
                  </a>
                </p>
                <p><strong>Created:</strong> {formatDate(analytics.createdAt)}</p>
                <p><strong>Last Accessed:</strong> {analytics.lastAccessed ? formatDate(analytics.lastAccessed) : 'Never'}</p>
              </div>

              <div className="analytics-card">
                <h4>📊 Click Statistics</h4>
                <p><strong>Total Clicks:</strong> {analytics.totalClicks}</p>
                <p><strong>Average Redirect Time:</strong> {analytics.avgRedirectTime}ms</p>
              </div>

              {analytics.recentClicks && analytics.recentClicks.length > 0 && (
                <div className="analytics-card" style={{ gridColumn: '1 / -1' }}>
                  <h4>🕒 Recent Clicks</h4>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Timestamp</th>
                          <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>IP Address</th>
                          <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Redirect Time</th>
                          <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>User Agent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentClicks.map((click, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '8px' }}>{formatDate(click.timestamp)}</td>
                            <td style={{ padding: '8px' }}>{click.ip}</td>
                            <td style={{ padding: '8px' }}>{click.redirectTime}ms</td>
                            <td style={{ padding: '8px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {click.userAgent}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
