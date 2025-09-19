// tests/health.test.js
const request = require('supertest');
const app = require('../../server');

describe('Health', () => {
  it('GET /health -> 200 or 204', async () => {
    const res = await request(app).get('/health');
    expect([200, 204]).toContain(res.statusCode);
  });
});
