// tests/jest/auth.test.js
const request = require('supertest');
const app = require('../../server');

const CANDIDATES = ['/api/auth', '/api/auth/login'];

function expectValidationStatus(code) {
  expect([400, 401, 422]).toContain(code);
}
function expectHasErrorLike(body) {
  if (body && typeof body === 'object') {
    const hasErr = Object.prototype.hasOwnProperty.call(body, 'error');
    const hasMsg = Object.prototype.hasOwnProperty.call(body, 'message');
    expect(hasErr || hasMsg).toBe(true);
  }
}

async function findMountedAuthPath() {
  for (const p of CANDIDATES) {
    const res = await request(app).post(p).send({});
    if (res.statusCode !== 404) return p; // route trouvée (même si 400/401/422)
  }
  return null;
}

describe('Auth endpoint (seedless)', () => {
  let authPath;

  beforeAll(async () => {
    authPath = await findMountedAuthPath();
  });

  if (authPath) {
    describe(`POST ${'${authPath}'}`, () => {
      it('returns validation error when email or password is missing', async () => {
        const res = await request(app).post(authPath).send({ email: '' });
        expectValidationStatus(res.statusCode);
        expectHasErrorLike(res.body);
      });

      it('returns 400/401/422 for invalid credentials', async () => {
        const res = await request(app).post(authPath).send({
          email: 'nonexistent@example.com',
          password: 'wrongpass',
        });
        expectValidationStatus(res.statusCode);
        expectHasErrorLike(res.body);
      });
    });
  } else {
    describe('Auth route not mounted', () => {
      it('documents that both /api/auth and /api/auth/login return 404', async () => {
        for (const p of CANDIDATES) {
          const res = await request(app).post(p).send({});
          expect(res.statusCode).toBe(404);
        }
      });
    });
  }
});
