// tests/jest/auth.test.js
const request = require('supertest');
const app = require('../../server');
const db = require('../../config/db');

afterAll(async () => {
  await db.end();
});

describe('POST /api/login', () => {
  it('should return 400 if email or password is missing', async () => {
    const res = await request(app).post('/api/login').send({ email: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/email and password/i);
  });

  it('should return 401 if credentials are invalid', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'nonexistent@example.com',
      password: 'wrongpass',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid credentials' });
  });
});
