// tests/jest/notes.test.js
const request = require('supertest');
const app = require('../../server');

describe('Notes endpoint', () => {
  it('POST /api/notes should return 401/403 without token', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ target_id: 'decision-123', target_type: 'decision', content: 'Test note' });
    expect([401, 403]).toContain(res.statusCode);
  });
});
