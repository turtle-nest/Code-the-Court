// backend/jest.config.js

module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/routes/'],
  verbose: true,
  testTimeout: 20000
};
