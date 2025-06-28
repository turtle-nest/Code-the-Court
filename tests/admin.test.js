// tests/admin.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_test_secret';

describe('POST /api/admin/approve', () => {
  let adminToken;
  let guestToken;

  beforeAll(() => {
    // Admin user
    const adminPayload = { id: 'admin-user-id', role: 'admin' };
    adminToken = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '1h' });

    // Guest user
    const guestPayload = { id: 'guest-user-id', role: 'guest' };
    guestToken = jwt.sign(guestPayload, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await db.end();
  });

  test('should allow admin to approve a user', async () => {
    const res = await request(app)
      .post('/api/admin/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: 'some-user-id' });

    expect([200, 201, 400]).toContain(res.statusCode);

    if (res.statusCode === 400) {
      expect(res.body).toHaveProperty('error');
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('should reject if user is not admin', async () => {
    const res = await request(app)
      .post('/api/admin/approve')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ userId: 'some-user-id' });

    expect(res.statusCode).toBe(403);
  });

  test('should reject if no token is provided', async () => {
    const res = await request(app)
      .post('/api/admin/approve')
      .send({ userId: 'some-user-id' });

    expect(res.statusCode).toBe(401);
  });
});
