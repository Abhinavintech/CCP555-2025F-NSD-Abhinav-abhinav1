const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

// Ensure aws-jwt-verify does not throw on require
process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

describe('PUT /v1/fragments/:id content-type mismatch', () => {
  let app;
  
  beforeAll(() => {
    passportMock.install({ email: 'dave@example.com' });
    app = require('../../src/app');
  });
  
  afterAll(() => {
    passportMock.restore();
  });

  test('returns 400 when content-type does not match existing fragment', async () => {
    // create fragment
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('hello')
      .expect(201);
    const frag = post.body.fragment;
    // attempt to update with a different content type
    await request(app)
      .put(`/v1/fragments/${frag.id}`)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ hi: 'there' }))
      .expect(400);
  });
});
