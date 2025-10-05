// Test the Create API function locally
const createHandler = require('./client/api/create.js');

// Mock request and response objects
const mockReq = {
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: {
    longUrl: 'https://www.google.com'
  }
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

async function testCreateAPI() {
  console.log('🧪 Testing Create API function...');
  try {
    await createHandler(mockReq, mockRes);
    console.log('✅ Create API test completed');
  } catch (error) {
    console.error('❌ Create API test failed:', error);
  }
}

testCreateAPI();
