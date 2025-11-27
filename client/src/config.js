// Get the server's base URL dynamically
function getServerBaseUrl() {
  // In production, use the same origin (deployed URL)
  if (process.env.NODE_ENV === 'production') {
    // If REACT_APP_API_URL is set, use it
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    // Otherwise, use the same origin as the frontend
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:5001';
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
