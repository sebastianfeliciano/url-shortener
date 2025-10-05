// Get the server's base URL dynamically
function getServerBaseUrl() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'http://localhost:5001';
  }
  
  // In development, if accessing via localhost, use the network IP
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Use the network IP that React dev server shows
      // This matches the IP the server is running on
      return 'http://192.168.1.162:5001';
    }
    // If accessing directly via IP, use that IP
    return `http://${window.location.hostname}:5001`;
  }
  
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
