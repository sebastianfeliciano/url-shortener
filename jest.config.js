module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/url-shortener/'],
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
  detectOpenHandles: true,
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(nanoid)/)'
  ]
};
