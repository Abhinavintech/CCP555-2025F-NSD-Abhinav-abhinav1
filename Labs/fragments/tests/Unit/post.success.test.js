// Ensure aws-jwt-verify env doesn't break require
process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

describe('POST /v1/fragments success path', () => {
  test('returns 201, Location header and fragment meta', async () => {
    passportMock.install({ email: 'postsuccess@example.com' });
    try {
      delete require.cache[require.resolve('../../src/app')];
    } catch (e) {}
    const app = require('../../src/app');

    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('hello world')
      .expect(201);

    passportMock.restore();

    expect(res.headers).toHaveProperty('location');
    // location should include the fragment id
    const bodyFragment = res.body && res.body.fragment;
    expect(bodyFragment).toBeDefined();
    expect(bodyFragment).toHaveProperty('id');
    expect(res.headers.location).toContain(bodyFragment.id);
    expect(bodyFragment).toHaveProperty('type', 'text/plain');
  });
});
