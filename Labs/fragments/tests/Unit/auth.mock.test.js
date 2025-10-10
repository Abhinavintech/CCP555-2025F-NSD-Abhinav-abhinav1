// Ensure minimal env vars so aws-jwt-verify does not throw when required
process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const passportMock = require('../helpers/passport-mock');

// Install mock so that requiring the app picks up the overridden passport.authenticate
passportMock.install({ email: 'alice@example.com' });
// Wire up the fragments app pieces we need
const fragmentsApp = require('../../src/app');

describe('passport mock integration', () => {
  let app;
  beforeAll(() => {
    app = express();
    // Use the real fragments app router
    app.use('/', fragmentsApp);
  });
  afterAll(() => {
    // restore passport to original state
    passportMock.restore();
  });

  test('POST /v1/fragments then GET /v1/fragments/:id', async () => {
    const payload = 'hello from test';
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(payload)
      .expect(201);

  // success shape uses createSuccessResponse -> { status: 'ok', fragment: {...} }
  expect(res.body).toHaveProperty('status', 'ok');
  expect(res.body).toHaveProperty('fragment');
  const frag = res.body.fragment;
    expect(frag).toHaveProperty('id');

    const get = await request(app)
      .get(`/v1/fragments/${frag.id}`)
      .expect(200);

    expect(get.text).toBe(payload);
  });
});
