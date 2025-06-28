// tests/profile.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_test_secret';

describe('GET /api/profile', () => {
  let token;

  beforeAll(() => {
    // Simuler un JWT valide
    const payload = { id: 'test-user-id', role: 'guest' };
    token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await db.end();
  });

  test('should return profile with valid token', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('profile');
    expect(res.body.profile).toHaveProperty('id', 'test-user-id');
  });

  test('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.statusCode).toBe(401);
  });
});
