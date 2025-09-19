// tests/jest/profile.test.js
const request = require('supertest');
const app = require('../../server');

describe('Profile endpoint', () => {
  it('GET /api/profile should return 401/403 without token', async () => {
    const res = await request(app).get('/api/profile');
    expect([401, 403]).toContain(res.statusCode);
  });
});
