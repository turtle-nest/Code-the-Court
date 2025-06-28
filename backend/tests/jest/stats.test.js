// tests/jest/stats.test.js
const request = require('supertest');
const app = require('../../server');
const db = require('../../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_test_secret';

describe('GET /api/decisions/stats', () => {
  let token;

  beforeAll(() => {
    const payload = { id: 'test-user-id', role: 'guest' };
    token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await db.end();
  });

  test('should return stats with valid token', async () => {
    const res = await request(app)
      .get('/api/decisions/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('archive');
    expect(res.body).toHaveProperty('judilibre');
  });

  test('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/decisions/stats');
    expect(res.statusCode).toBe(401);
  });
});
