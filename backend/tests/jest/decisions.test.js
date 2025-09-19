// tests/jest/decisions.test.js
const request = require('supertest');
const app = require('../../server');

describe('Decisions endpoint', () => {
  it('GET /api/decisions -> 200 or 204', async () => {
    const res = await request(app).get('/api/decisions');
    expect([200, 204]).toContain(res.statusCode);
  });

  it('GET /api/decisions with invalid date -> 400/422', async () => {
    const res = await request(app).get('/api/decisions').query({ date: 'not-a-date' });
    expect([400, 422]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('error');
  });
});
