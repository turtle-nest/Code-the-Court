// tests/auth.test.js
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../server');
const db = require('../config/db');

beforeAll(async () => {
  // Préparation d'un utilisateur valide en BDD
  const hashedPassword = await bcrypt.hash('TestPass123', 10);
  await db.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
  await db.query(
    'INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, $3, $4)',
    ['test@example.com', hashedPassword, 'guest', 'approved']
  );
});

afterAll(async () => {
  // Nettoyage : suppression de l'utilisateur
  await db.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
  await db.end();
});

describe('POST /api/login', () => {
  it('should return 400 if email or password is missing', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: '' });
    expect(res.statusCode).toEqual(400);
  });

  it('should return 401 if credentials are invalid', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'wrong@example.com', password: 'badpass' });
    expect(res.statusCode).toEqual(401);
  });

  it('should return a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'TestPass123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
