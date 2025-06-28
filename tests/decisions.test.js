// tests/decisions.test.js
const request = require('supertest');
const app = require('../server'); // ton entry point Express

let token; // Token JWT récupéré avant les tests protégés

describe('Decisions API', () => {
  // Avant tous les tests : se connecter et récupérer un token
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin1234!'
      });
    token = res.body.token;
    expect(token).toBeDefined();
  });

  it('GET /api/decisions should return decisions', async () => {
    const res = await request(app).get('/api/decisions');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/decisions/juridictions should return list of jurisdictions', async () => {
    const res = await request(app)
      .get('/api/decisions/juridictions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/decisions/case-types should return list of case types', async () => {
    const res = await request(app)
      .get('/api/decisions/case-types')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
