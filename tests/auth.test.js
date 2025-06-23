const request = require('supertest');
const app = require('../server');

describe('POST /api/login', () => {
  it('should return 400 if email or password missing', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: '' });
    expect(res.statusCode).toEqual(400);
  });

  it('should return 401 if invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'wrong@example.com', password: 'badpass' });
    expect(res.statusCode).toEqual(401);
  });

  it('should return a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'fakehash' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
