const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

// Ensure aws-jwt-verify does not throw on require
process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

describe('GET /v1/fragments list', () => {
  let app;
  
  beforeAll(() => {
    passportMock.install({ email: 'carol@example.com' });
    app = require('../../src/app');
  });
  
  afterAll(() => {
    passportMock.restore();
  });

  test('GET /v1/fragments returns array (possibly empty)', async () => {
    const res = await request(app).get('/v1/fragments').expect(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('fragments');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('GET /v1/fragments?expand=1 returns full metadata objects', async () => {
    const res = await request(app).get('/v1/fragments?expand=1').expect(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    // if non-empty, each element should be an object with id/type
    if (res.body.fragments.length > 0) {
      expect(res.body.fragments[0]).toHaveProperty('id');
      expect(res.body.fragments[0]).toHaveProperty('type');
    }
  });
});
