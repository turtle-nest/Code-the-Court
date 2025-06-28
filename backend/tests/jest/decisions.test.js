// tests/jest/decisions.test.js
const request = require('supertest');
const app = require('../../server');
const db = require('../../config/db');

let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/login')
    .send({
      email: 'admin@example.com',
      password: 'Admin1234!'
    });
  token = res.body.token;
});

afterAll(async () => {
  await db.end();
});

describe('Decisions API', () => {
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
