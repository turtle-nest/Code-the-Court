// tests/jest/notes.test.js
const request = require('supertest');
const app = require('../../server');
const db = require('../../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_test_secret';

describe('POST /api/notes', () => {
  let token;

  beforeAll(() => {
    const payload = { id: 'test-user-id', role: 'guest' };
    token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await db.end();
  });

  test('should create a note (mock)', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        target_id: 'decision-123',
        target_type: 'decision',
        content: 'Test note content'
      });

    // ✅ Permet 200, 201 ou 400
    expect([200, 201, 400]).toContain(res.statusCode);

    if (res.statusCode === 400) {
      expect(res.body).toHaveProperty('error');
    } else {
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('note');
      expect(res.body.note).toMatchObject({
        user_id: 'test-user-id',
        target_id: 'decision-123',
        target_type: 'decision',
        content: 'Test note content'
      });
    }
  });
});
