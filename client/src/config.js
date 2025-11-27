// Get the server's base URL dynamically
function getServerBaseUrl() {
  // In production, check for REACT_APP_API_URL first (for Render backend)
  if (process.env.NODE_ENV === 'production') {
    // If REACT_APP_API_URL is set, use it (points to Render backend)
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    // Otherwise, use the same origin as the frontend (for full-stack on same domain)
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }
  
  // In development, use localhost:5001
  return 'http://localhost:5001';
}

const SERVER_BASE_URL = getServerBaseUrl();

const config = {
  // Use dynamic URLs in development, full URLs in production
  API_BASE_URL: SERVER_BASE_URL,
  // For short URLs, always show the full URL so users can copy/share them
  SHORT_URL_BASE: SERVER_BASE_URL
};

export default config;
