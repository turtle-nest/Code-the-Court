// tests/auth.test.js
const request = require('supertest');
const app = require('../server'); // ou '../app' selon ton fichier

describe('POST /api/login', () => {
  it('should return 400 if email or password is missing', async () => {
    const res = await request(app).post('/api/login').send({ email: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Email and password required' });
  });

  it('should return 401 if credentials are invalid', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'nonexistent@example.com',
      password: 'wrongpass',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid credentials' });
  });

  // ⚠️ Nécessite un utilisateur connu en base (à adapter avec ton seed)
  // it('should return 200 and a token if credentials are valid', async () => {
  //   const res = await request(app).post('/api/login').send({
  //     email: 'user@example.com',
  //     password: 'correctpassword',
  //   });
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toHaveProperty('token');
  // });
});
