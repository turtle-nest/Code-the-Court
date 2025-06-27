// tests/stats.test.js
const request = require('supertest');
const app = require('../server'); // point d'entrée express
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_test_secret';

describe('GET /api/decisions/stats', () => {
  let token;

  beforeAll(() => {
    // Simuler un utilisateur avec JWT (fake ID + rôle guest/admin)
    const payload = { id: 'test-user-id', role: 'guest' };
    token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await db.end(); // Fermer la connexion si tu utilises pg.Pool
  });

  test('should return stats with valid token', async () => {
    const res = await request(app)
      .get('/api/decisions/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('archive');
    expect(res.body).toHaveProperty('judilibre');

    expect(typeof res.body.total).toBe('number');
    expect(typeof res.body.archive).toBe('number');
    expect(typeof res.body.judilibre).toBe('number');
  });

  test('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/decisions/stats');
    expect(res.statusCode).toBe(401);
  });
});
