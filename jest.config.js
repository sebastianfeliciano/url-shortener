module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/client/',
    '/build/',
    'node_modules/.*\\.test\\.js$'
  ],
  collectCoverageFrom: [
    'server.js',
    'middleware/**/*.js',
    '!node_modules/**',
    '!client/**',
    '!tests/**',
    '!api/**'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/client/',
    '/tests/',
    '/build/'
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