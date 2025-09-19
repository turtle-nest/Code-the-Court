// backend/jest.config.js

module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/routes/'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  testTimeout: 20000
};
