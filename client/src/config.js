const config = {
  // Use full URLs in development to connect to backend on port 5001
  // Use full URLs in production
  API_BASE_URL: process.env.NODE_ENV === 'production'
    ? (process.env.REACT_APP_API_URL || 'http://localhost:5001')
    : 'http://localhost:5001',
  // For short URLs, always show the full URL so users can copy/share them
  SHORT_URL_BASE: process.env.NODE_ENV === 'production'
    ? (process.env.REACT_APP_SHORT_URL_BASE || 'http://localhost:5001')
    : 'http://localhost:5001'
};

export default config;
