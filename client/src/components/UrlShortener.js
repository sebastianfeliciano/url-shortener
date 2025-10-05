import React, { useState } from 'react';
import config from '../config';

const UrlShortener = () => {
  const [longUrl, setLongUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      alert('Copied to clipboard!');
    });
  };

  return (
    <div>
      <h2>Shorten Your URL</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="longUrl">Enter your long URL:</label>
          <input
            type="url"
            id="longUrl"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            required
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result-card">
          <h3>✅ URL Shortened Successfully!</h3>
          
          <div>
            <strong>Short URL:</strong>
            <div className="url-display">
              {config.SHORT_URL_BASE}/{result.shortUrl}
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(`${config.SHORT_URL_BASE}/${result.shortUrl}`)}
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <strong>Original URL:</strong>
            <div className="url-display">
              {result.longUrl}
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(result.longUrl)}
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <strong>Click Count:</strong> {result.clickCount}
          </div>

          {result.qrCode && (
            <div className="qr-code">
              <h4>QR Code:</h4>
              <img src={result.qrCode} alt="QR Code" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UrlShortener;
