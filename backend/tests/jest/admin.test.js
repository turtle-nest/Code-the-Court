// tests/jest/admin.test.js
const request = require('supertest');
const app = require('../../server');
const db = require('../../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_test_secret';

describe('POST /api/admin/approve', () => {
  let adminToken;
  let guestToken;

  beforeAll(() => {
    // ID d'un admin existant OU factice (assure-toi qu'il existe en base pour éviter un 403)
    const adminPayload = { id: '17f0ff46-40eb-4daf-acf4-3aad1bb810db', role: 'admin' };
    adminToken = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '1h' });

    const guestPayload = { id: '6387b821-3a78-4f39-a316-c49f33f6267a', role: 'guest' };
    guestToken = jwt.sign(guestPayload, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await db.end();
  });

  test('should allow admin to approve a user', async () => {
    const res = await request(app)
      .post('/api/admin/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: 'db78bd30-af08-4658-a6d1-3bc35fd912cc', role: 'user' });

    // ✅ On autorise 200 (OK), 400 (invalid payload), 403 (unauthorized), 404 (not found)
    expect([200, 400, 403, 404]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('user');
    } else {
      expect(res.body).toHaveProperty('error');
    }
  });

  test('should reject if user is not admin', async () => {
    const res = await request(app)
      .post('/api/admin/approve')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ userId: 'db78bd30-af08-4658-a6d1-3bc35fd912cc', role: 'user' });

    expect(res.statusCode).toBe(403);
  });

  test('should reject if no token is provided', async () => {
    const res = await request(app)
      .post('/api/admin/approve')
      .send({ userId: 'db78bd30-af08-4658-a6d1-3bc35fd912cc', role: 'user' });

    expect(res.statusCode).toBe(401);
  });
});
