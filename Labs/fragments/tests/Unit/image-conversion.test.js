// Ensure aws-jwt-verify does not throw on require
process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

// tiny 1x1 PNG (base64)
const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
const tinyPngBuffer = Buffer.from(tinyPngBase64, 'base64');

describe('image conversions', () => {
  test('PNG -> JPEG and PNG -> WEBP conversions', async () => {
    passportMock.install({ email: 'img@example.com' });
    const app = require('../../src/app');
    // POST PNG
    const post = await request(app).post('/v1/fragments').set('Content-Type', 'image/png').send(tinyPngBuffer).expect(201);
    const id = post.body.fragment.id;

    // GET as .jpg
    const jpg = await request(app).get(`/v1/fragments/${id}.jpg`).expect(200);
    expect(jpg.header['content-type']).toBe('image/jpeg');
    expect(jpg.body.length).toBeGreaterThan(0);

    // GET as .webp
    const webp = await request(app).get(`/v1/fragments/${id}.webp`).expect(200);
    expect(webp.header['content-type']).toBe('image/webp');
    expect(webp.body.length).toBeGreaterThan(0);

    passportMock.restore();
  });
});
