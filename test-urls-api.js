// Test the URLs API function locally
const urlsHandler = require('./client/api/urls.js');

// Mock request and response objects
const mockReq = {
  method: 'GET',
  headers: {}
};

const mockRes = {
  status: (code) => ({
    json: (data) => {
      console.log('📡 Response Status:', code);
      console.log('📡 Response Data:', JSON.stringify(data, null, 2));
      return { status: code, data };
    }
  }),
  setHeader: (name, value) => {
    console.log('📋 Header Set:', name, '=', value);
  },
  end: () => {
    console.log('📋 Response ended');
  }
};

async function testUrlsAPI() {
  console.log('🧪 Testing URLs API function...');
  try {
    await urlsHandler(mockReq, mockRes);
    console.log('✅ URLs API test completed');
  } catch (error) {
    console.error('❌ URLs API test failed:', error);
  }
}

testUrlsAPI();
