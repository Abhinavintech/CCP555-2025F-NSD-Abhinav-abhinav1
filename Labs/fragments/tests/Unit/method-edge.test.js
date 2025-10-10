process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

describe('Method edge cases for /v1/fragments/:id', () => {
  test('POST to /v1/fragments/:id returns 405', async () => {
    passportMock.install({ email: 'method@example.com' });
    try {
      delete require.cache[require.resolve('../../src/app')];
    } catch (e) {}
    const app = require('../../src/app');

    // create a fragment
    const post = await request(app).post('/v1/fragments').set('Content-Type', 'text/plain').send('x').expect(201);
    const id = post.body.fragment.id;

    await request(app).post(`/v1/fragments/${id}`).send('x').expect(405);
    passportMock.restore();
  });

  test('Unknown method (PATCH) to /v1/fragments/:id returns 405', async () => {
    passportMock.install({ email: 'method2@example.com' });
    try {
      delete require.cache[require.resolve('../../src/app')];
    } catch (e) {}
    const app = require('../../src/app');

    const post = await request(app).post('/v1/fragments').set('Content-Type', 'text/plain').send('y').expect(201);
    const id = post.body.fragment.id;

    await request(app).patch(`/v1/fragments/${id}`).send({}).expect(405);
    passportMock.restore();
  });
});
