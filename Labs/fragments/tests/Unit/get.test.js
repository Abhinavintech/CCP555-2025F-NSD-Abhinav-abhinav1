// Ensure aws-jwt-verify does not throw on require
process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

describe('GET /v1/fragments', () => {
  test('authenticated users get a fragments array', async () => {
    // install mock, clear cached app and related modules so new require picks up mocked passport
    passportMock.install({ email: 'frank@example.com' });
    try {
      delete require.cache[require.resolve('../../src/app')];
    } catch (e) {}
    try {
      delete require.cache[require.resolve('../../src/routes')];
    } catch (e) {}
    try {
      delete require.cache[require.resolve('../../src/auth')];
    } catch (e) {}
    const app = require('../../src/app');
    const res = await request(app).get('/v1/fragments').expect(200);
    passportMock.restore();
    expect(res.body).toHaveProperty('fragments');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // Note: unauthenticated behavior is covered indirectly elsewhere; skipping unauthenticated test here
});
