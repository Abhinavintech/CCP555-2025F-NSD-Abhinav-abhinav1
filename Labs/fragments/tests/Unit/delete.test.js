// Ensure aws-jwt-verify does not throw on require
process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

describe('DELETE /v1/fragments/:id', () => {
  let app;
  
  beforeAll(() => {
    passportMock.install({ email: 'eve@example.com' });
    app = require('../../src/app');
  });
  
  afterAll(() => {
    passportMock.restore();
  });

  test('create and delete fragment', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('to-delete')
      .expect(201);
    const frag = post.body.fragment;
    await request(app).delete(`/v1/fragments/${frag.id}`).expect(200);
    // subsequent GET info should be 404
    await request(app).get(`/v1/fragments/${frag.id}/info`).expect(404);
  });
});
