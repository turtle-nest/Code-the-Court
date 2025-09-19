// tests/jest/stats.test.js
const request = require('supertest');
const app = require('../../server');

describe('Stats endpoint', () => {
  it('GET /api/decisions/stats should return 401/403 without token', async () => {
    const res = await request(app).get('/api/decisions/stats');
    expect([401, 403]).toContain(res.statusCode);
  });
});
