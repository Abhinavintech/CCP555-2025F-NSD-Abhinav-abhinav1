// Ensure aws-jwt-verify does not throw on require
process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

describe('POST /v1/fragments unsupported type', () => {
  let app;
  
  beforeAll(() => {
    passportMock.install({ email: 'bob@example.com' });
    app = require('../../src/app');
  });
  
  afterAll(() => {
    passportMock.restore();
  });

  test('returns 415 for unsupported Content-Type', async () => {
    await request(app).post('/v1/fragments').set('Content-Type', 'application/unsupported').send('x').expect(415);
  });
});
