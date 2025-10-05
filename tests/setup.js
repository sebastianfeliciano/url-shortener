// Test setup file
const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/urlshortener_test';

// Increase timeout for database operations
jest.setTimeout(10000);
