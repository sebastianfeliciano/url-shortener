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
      const apiUrl = `${config.API_BASE_URL}/api/urls`;
      console.log('🔍 Config object:', config);
      console.log('🔍 API_BASE_URL:', config.API_BASE_URL);
      console.log('🔍 Full API URL:', apiUrl);
      console.log('🔍 Environment variables:', {
        REACT_APP_API_URL: process.env.REACT_APP_API_URL,
        NODE_ENV: process.env.NODE_ENV
      });
      
      const response = await fetch(apiUrl);
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (response.ok) {
        setAllUrls(data);
        console.log('✅ URLs set successfully:', data.length, 'items');
      } else {
        console.error('❌ API error:', data);
        setError('Failed to fetch URLs: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('💥 Network error fetching URLs:', err);
      console.error('💥 Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
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

      {/* Debug Test Button */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={fetchAllUrls}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Test API Connection
        </button>
        <p style={{ fontSize: '12px', color: 'white', marginTop: '5px' }}>
          Click to test API connection and check browser console for details
        </p>
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
                      <a 
                        href={`${config.SHORT_URL_BASE}/${url.shortUrl}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#1976d2', 
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#e3f2fd',
                          border: '1px solid #1976d2'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {config.SHORT_URL_BASE ? `${config.SHORT_URL_BASE}/${url.shortUrl}` : `/${url.shortUrl}`}
                      </a>
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
          <h3>📈 Detailed Analytics for 
            <a 
              href={`${config.SHORT_URL_BASE}/${selectedUrl.shortUrl}`}
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ marginLeft: '5px', color: '#000000' }}
            >
              {config.SHORT_URL_BASE ? `${config.SHORT_URL_BASE}/${selectedUrl.shortUrl}` : `/${selectedUrl.shortUrl}`}
            </a>
          </h3>
          
          {loading && <p>Loading analytics...</p>}
          
          {analytics && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px',
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ color: '#1976d2', marginBottom: '15px', fontSize: '18px' }}>🔗 URL Information</h4>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#495057' }}>Short URL:</strong>
                  <div style={{ 
                    marginTop: '5px',
                    padding: '8px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '4px',
                    border: '1px solid #1976d2'
                  }}>
                    <a 
                      href={`${config.SHORT_URL_BASE}/${analytics.shortUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                      {config.SHORT_URL_BASE ? `${config.SHORT_URL_BASE}/${analytics.shortUrl}` : `/${analytics.shortUrl}`}
                    </a>
                  </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#495057' }}>Long URL:</strong>
                  <div style={{ 
                    marginTop: '5px',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    wordBreak: 'break-all',
                    fontSize: '14px'
                  }}>
                    <a href={analytics.longUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                      {analytics.longUrl}
                    </a>
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#495057' }}>Created:</strong> 
                  <span style={{ marginLeft: '5px', color: '#6c757d' }}>{formatDate(analytics.createdAt)}</span>
                </div>
                <div>
                  <strong style={{ color: '#495057' }}>Last Accessed:</strong> 
                  <span style={{ marginLeft: '5px', color: '#6c757d' }}>
                    {analytics.lastAccessed ? formatDate(analytics.lastAccessed) : 'Never'}
                  </span>
                </div>
              </div>

              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ color: '#28a745', marginBottom: '15px', fontSize: '18px' }}>📊 Click Statistics</h4>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '10px',
                    backgroundColor: analytics.totalClicks > 0 ? '#d4edda' : '#f8d7da',
                    borderRadius: '6px',
                    border: `1px solid ${analytics.totalClicks > 0 ? '#c3e6cb' : '#f5c6cb'}`
                  }}>
                    <span style={{ fontWeight: 'bold', color: '#495057' }}>Total Clicks:</span>
                    <span style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: analytics.totalClicks > 0 ? '#155724' : '#721c24'
                    }}>
                      {analytics.totalClicks}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '10px',
                    backgroundColor: '#e2e3e5',
                    borderRadius: '6px',
                    border: '1px solid #d6d8db'
                  }}>
                    <span style={{ fontWeight: 'bold', color: '#495057' }}>Avg Redirect Time:</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#495057' }}>
                      {analytics.avgRedirectTime}ms
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div style={{ 
                gridColumn: '1 / -1',
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h4 style={{ color: '#6f42c1', marginBottom: '15px', fontSize: '18px' }}>📱 QR Code</h4>
                <div style={{ 
                  display: 'inline-block',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px solid #6f42c1'
                }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(config.SHORT_URL_BASE ? `${config.SHORT_URL_BASE}/${analytics.shortUrl}` : `/${analytics.shortUrl}`)}`}
                    alt="QR Code"
                    style={{ 
                      display: 'block',
                      maxWidth: '200px',
                      height: 'auto'
                    }}
                  />
                </div>
                <p style={{ 
                  marginTop: '10px', 
                  fontSize: '14px', 
                  color: '#6c757d',
                  fontStyle: 'italic'
                }}>
                  Scan this QR code to visit the short URL
                </p>
              </div>

              {analytics.recentClicks && analytics.recentClicks.length > 0 && (
                <div style={{ 
                  gridColumn: '1 / -1',
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <h4 style={{ color: '#fd7e14', marginBottom: '15px', fontSize: '18px' }}>🕒 Recent Clicks</h4>
                  <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                          <th style={{ 
                            padding: '12px', 
                            textAlign: 'left', 
                            borderBottom: '2px solid #dee2e6',
                            fontWeight: 'bold',
                            color: '#495057'
                          }}>Timestamp</th>
                          <th style={{ 
                            padding: '12px', 
                            textAlign: 'left', 
                            borderBottom: '2px solid #dee2e6',
                            fontWeight: 'bold',
                            color: '#495057'
                          }}>IP Address</th>
                          <th style={{ 
                            padding: '12px', 
                            textAlign: 'left', 
                            borderBottom: '2px solid #dee2e6',
                            fontWeight: 'bold',
                            color: '#495057'
                          }}>Redirect Time</th>
                          <th style={{ 
                            padding: '12px', 
                            textAlign: 'left', 
                            borderBottom: '2px solid #dee2e6',
                            fontWeight: 'bold',
                            color: '#495057'
                          }}>User Agent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentClicks.map((click, index) => (
                          <tr key={index} style={{ 
                            borderBottom: '1px solid #dee2e6',
                            backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa'
                          }}>
                            <td style={{ 
                              padding: '10px',
                              color: '#495057',
                              fontSize: '14px'
                            }}>{formatDate(click.timestamp)}</td>
                            <td style={{ 
                              padding: '10px',
                              color: '#495057',
                              fontFamily: 'monospace',
                              fontSize: '14px'
                            }}>{click.ip}</td>
                            <td style={{ 
                              padding: '10px',
                              color: '#495057',
                              fontSize: '14px'
                            }}>{click.redirectTime}ms</td>
                            <td style={{ 
                              padding: '10px', 
                              maxWidth: '200px', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              color: '#6c757d',
                              fontSize: '12px'
                            }}>
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
