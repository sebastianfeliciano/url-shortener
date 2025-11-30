module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/url-shortener/', '/client/', '/build/'],
  collectCoverageFrom: [
    'server.js',
    'middleware/**/*.js',
    '!node_modules/**',
    '!client/**',
    '!tests/**',
    '!url-shortener/**',
    '!api/**'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/client/',
    '/tests/',
    '/url-shortener/'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true
};
