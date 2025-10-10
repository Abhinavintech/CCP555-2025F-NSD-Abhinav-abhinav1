process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

describe('Owner isolation and authenticated positive flows', () => {
  test('user A cannot access or delete user B fragment (403)', async () => {
    // create fragment as user A; install mock once and reuse
    passportMock.install({ email: 'alice@example.com' });
    try {
      delete require.cache[require.resolve('../../src/app')];
      delete require.cache[require.resolve('../../src/routes')];
      delete require.cache[require.resolve('../../src/auth')];
    } catch (e) {}
    const app = require('../../src/app');

    const post = await request(app).post('/v1/fragments').set('Content-Type', 'text/plain').send('owned by alice').expect(201);
    const id = post.body.fragment.id;

    // quick sanity check: read stored meta and verify hashes
    const storage = require('../../src/storage');
    const crypto = require('crypto');
    const meta = storage.readFragmentMeta(id);
    const aliceHash = crypto.createHash('sha256').update('alice@example.com').digest('hex');
    const bobHash = crypto.createHash('sha256').update('bob@example.com').digest('hex');
    // meta.ownerId should match alice and not bob
    expect(meta.ownerId).toBe(aliceHash);
    expect(meta.ownerId).not.toBe(bobHash);

    // swap to user B using setUser; use same app instance
    passportMock.setUser({ email: 'bob@example.com' });

  // debug info
  const logger = require('../../src/logger');
  logger.debug({ 'meta.ownerId': meta.ownerId, aliceHash, bobHash });

    const resGet = await request(app).get(`/v1/fragments/${id}`);
  logger.debug({ GET_status: resGet.status, body: resGet.body ? resGet.body : resGet.text });
    expect(resGet.status).toBe(403);

    const resDel = await request(app).delete(`/v1/fragments/${id}`);
  logger.debug({ DEL_status: resDel.status, body: resDel.body ? resDel.body : resDel.text });
    expect(resDel.status).toBe(403);
    passportMock.restore();
  });

  test('owner can PUT update fragment with same content-type (200) and id remains same', async () => {
    passportMock.install({ email: 'carol2@example.com' });
    try {
      delete require.cache[require.resolve('../../src/app')];
      delete require.cache[require.resolve('../../src/routes')];
      delete require.cache[require.resolve('../../src/auth')];
    } catch (e) {}
    const app = require('../../src/app');

    const post = await request(app).post('/v1/fragments').set('Content-Type', 'text/plain').send('first').expect(201);
    const id = post.body.fragment.id;

    const put = await request(app).put(`/v1/fragments/${id}`).set('Content-Type', 'text/plain').send('updated content').expect(200);
    expect(put.body).toHaveProperty('status', 'ok');
    expect(put.body.fragment).toHaveProperty('id', id);
    expect(put.body.fragment).toHaveProperty('type', 'text/plain');

    // GET should return the updated body
    const get = await request(app).get(`/v1/fragments/${id}`).expect(200);
    expect(get.text).toBe('updated content');

    passportMock.restore();
  });

  test('owner can delete their fragment and it becomes 404', async () => {
    passportMock.install({ email: 'donna@example.com' });
    try {
      delete require.cache[require.resolve('../../src/app')];
      delete require.cache[require.resolve('../../src/routes')];
      delete require.cache[require.resolve('../../src/auth')];
    } catch (e) {}
    const app = require('../../src/app');

    const post = await request(app).post('/v1/fragments').set('Content-Type', 'text/plain').send('bye').expect(201);
    const id = post.body.fragment.id;

    await request(app).delete(`/v1/fragments/${id}`).expect(200);
    await request(app).get(`/v1/fragments/${id}`).expect(404);

    passportMock.restore();
  });
});
