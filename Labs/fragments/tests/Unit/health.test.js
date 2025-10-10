// Ensure aws-jwt-verify doesn't crash when the app is required
process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const app = require('../../src/app');

describe('health route', () => {
  test('GET / returns status ok and required fields', async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('author');
    expect(res.body).toHaveProperty('version');
    expect(res.header).toHaveProperty('cache-control');
  });
});
