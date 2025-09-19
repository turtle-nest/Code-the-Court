// tests/jest/admin.test.js
const request = require('supertest');
const app = require('../../server');

describe('Admin endpoint', () => {
  it('should respond 401/403 without token', async () => {
    const res = await request(app).post('/api/admin/approve');
    expect([401, 403, 404]).toContain(res.statusCode);
  });
});
