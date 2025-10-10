process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

describe('GET /v1/fragments/:id/info', () => {
  test('returns fragment metadata wrapped in success response', async () => {
    passportMock.install({ email: 'info@example.com' });
    try {
      delete require.cache[require.resolve('../../src/app')];
    } catch (e) {}
    const app = require('../../src/app');

    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('meta-test')
      .expect(201);

    const id = post.body.fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}/info`).expect(200);
    passportMock.restore();

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('fragment');
    expect(res.body.fragment).toHaveProperty('id', id);
    expect(res.body.fragment).toHaveProperty('type', 'text/plain');
  });
});
