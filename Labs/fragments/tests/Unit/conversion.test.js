// Ensure aws-jwt-verify does not throw on require
process.env.AWS_COGNITO_POOL_ID = process.env.AWS_COGNITO_POOL_ID || 'us-east-1_abcdefghi';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'testclientid';

const request = require('supertest');
const passportMock = require('../helpers/passport-mock');

describe('conversion tests', () => {
  test('CSV -> JSON conversion', async () => {
    passportMock.install({ email: 'conv1@example.com' });
    const app = require('../../src/app');
    const csv = 'name,age\nAlice,30\nBob,25';
    const post = await request(app).post('/v1/fragments').set('Content-Type', 'text/csv').send(csv).expect(201);
    const id = post.body.fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}.json`).expect(200);
    passportMock.restore();
    const arr = JSON.parse(res.text);
    expect(Array.isArray(arr)).toBe(true);
    expect(arr[0]).toHaveProperty('name', 'Alice');
  });

  test('JSON -> CSV conversion', async () => {
    passportMock.install({ email: 'conv2@example.com' });
    const app = require('../../src/app');
    const obj = [{ name: 'X', value: 1 }, { name: 'Y', value: 2 }];
    const post = await request(app).post('/v1/fragments').set('Content-Type', 'application/json').send(JSON.stringify(obj)).expect(201);
    const id = post.body.fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}.csv`).expect(200);
    passportMock.restore();
    const text = res.text;
    expect(text).toMatch(/name,value/);
    expect(text).toMatch(/X/);
  });

  test('JSON <-> YAML conversion', async () => {
    passportMock.install({ email: 'conv3@example.com' });
    const app = require('../../src/app');
    const obj = { a: 1, b: { c: 2 } };
    const post = await request(app).post('/v1/fragments').set('Content-Type', 'application/json').send(JSON.stringify(obj)).expect(201);
    const id = post.body.fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}.yaml`).expect(200);
    passportMock.restore();
    expect(res.text).toMatch(/a:\s*1/);
  });

  test('JSON -> TXT conversion', async () => {
    passportMock.install({ email: 'conv4@example.com' });
    const app = require('../../src/app');
    const obj = { hello: 'world', list: [1,2,3] };
    const post = await request(app).post('/v1/fragments').set('Content-Type', 'application/json').send(JSON.stringify(obj)).expect(201);
    const id = post.body.fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}.txt`).expect(200);
    passportMock.restore();
    expect(res.text).toMatch(/"hello": "world"/);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
  });

  test('YAML -> TXT conversion', async () => {
    passportMock.install({ email: 'conv5@example.com' });
    const app = require('../../src/app');
    const yaml = 'a: 1\nb:\n  c: 2';
    const post = await request(app).post('/v1/fragments').set('Content-Type', 'application/yaml').send(yaml).expect(201);
    const id = post.body.fragment.id;
    const res = await request(app).get(`/v1/fragments/${id}.txt`).expect(200);
    passportMock.restore();
    expect(res.text).toMatch(/a:\s*1/);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
  });
});
