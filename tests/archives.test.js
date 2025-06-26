
// tests/archives.test.js
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../server');
const db = require('../config/db');

let token;

beforeAll(async () => {
  // Login and get JWT
  const res = await request(app)
    .post('/api/login')
    .send({
      email: 'admin@example.com',
      password: 'Admin1234!'
    });

  token = res.body.token;

  // Clean up existing test archives
  await db.query("DELETE FROM archives WHERE title = 'Test archive from Jest'");
});

afterAll(async () => {
  await db.end();
});

describe('Full archive cycle', () => {
  it('should create an archive', async () => {
    const res = await request(app)
      .post('/api/archives')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Test archive from Jest')
      .field('content', 'This is a test archive')
      .field('date', '2024-01-01')
      .field('jurisdiction', 'Test Jurisdiction')
      .field('location', 'Paris')
      .attach('pdf', path.join(__dirname, 'testfile.pdf'));

    expect(res.statusCode).toBe(201);
    expect(res.body.archive_id).toBeDefined();
  });

  it('should retrieve the archive in list', async () => {
    const res = await request(app)
      .get('/api/archives')
      .set('Authorization', `Bearer ${token}`);

    const found = res.body.some(a => a.title === 'Test archive from Jest');
    expect(found).toBe(true);
  });
});
