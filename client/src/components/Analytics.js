import React, { useState } from 'react';

const Analytics = () => {
  const [shortUrl, setShortUrl] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnalytics(null);

    try {
      const response = await fetch(`/api/analytics/${shortUrl}`);
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h2>📊 URL Analytics</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="shortUrl">Enter short URL code:</label>
          <input
            type="text"
            id="shortUrl"
            value={shortUrl}
            onChange={(e) => setShortUrl(e.target.value)}
            placeholder="abc12345"
            required
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Loading...' : 'Get Analytics'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>🔗 URL Information</h3>
            <p><strong>Short URL:</strong> {analytics.shortUrl}</p>
            <p><strong>Long URL:</strong> {analytics.longUrl}</p>
            <p><strong>Created:</strong> {formatDate(analytics.createdAt)}</p>
            <p><strong>Last Accessed:</strong> {analytics.lastAccessed ? formatDate(analytics.lastAccessed) : 'Never'}</p>
          </div>

          <div className="analytics-card">
            <h3>📈 Click Statistics</h3>
            <p><strong>Total Clicks:</strong> {analytics.totalClicks}</p>
            <p><strong>Average Redirect Time:</strong> {analytics.avgRedirectTime}ms</p>
          </div>

          {analytics.recentClicks && analytics.recentClicks.length > 0 && (
            <div className="analytics-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🕒 Recent Clicks</h3>
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
  );
};

export default Analytics;
