/**
 * @file __tests__/decisions.test.js
 * @description Tests for GET /api/decisions with pagination & sorting validation
 */

const request = require('supertest');
const app = require('../../server');
const db = require('../../config/db'); // ✅ ferme proprement le pool

afterAll(async () => {
  await db.end();
});

describe('GET /api/decisions - validateDecisionsQuery', () => {
  test('should return 200 with valid query params', async () => {
    const res = await request(app)
      .get('/api/decisions')
      .query({ page: 1, limit: 10, sortBy: 'date', order: 'desc' });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should return 400 for invalid page', async () => {
    const res = await request(app)
      .get('/api/decisions')
      .query({ page: 0 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/Page must be a positive integer/);
  });

  test('should return 400 for invalid limit', async () => {
    const res = await request(app)
      .get('/api/decisions')
      .query({ limit: 999 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/Limit must be a positive integer/);
  });

  test('should return 400 for invalid sortBy field', async () => {
    const res = await request(app)
      .get('/api/decisions')
      .query({ sortBy: 'invalid_field' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/Invalid sortBy field/);
  });

  test('should return 400 for invalid order', async () => {
    const res = await request(app)
      .get('/api/decisions')
      .query({ order: 'up' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/Order must be "asc" or "desc"/i);
  });
});
