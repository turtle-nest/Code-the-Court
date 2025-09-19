// tests/jest/archives.test.js
const request = require('supertest');
const app = require('../../server');

describe('Archives endpoint', () => {
  it('POST /api/archives should return 401/403 without token', async () => {
    const res = await request(app)
      .post('/api/archives')
      .field('title', 'Test archive')
      .field('date', '2024-01-01');
    expect([401, 403]).toContain(res.statusCode);
  });
});
