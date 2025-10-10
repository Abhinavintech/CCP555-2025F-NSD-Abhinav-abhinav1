// Ensure aws-jwt-verify does not throw on require
process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

// install mock so the app loads with mocked passport
passportMock.install({ email: 'bob@example.com' });
const app = require('../../src/app');
passportMock.restore();

describe('POST /v1/fragments unsupported type', () => {
  test('returns 415 for unsupported Content-Type', async () => {
    await request(app).post('/v1/fragments').set('Content-Type', 'application/unsupported').send('x').expect(415);
  });
});
