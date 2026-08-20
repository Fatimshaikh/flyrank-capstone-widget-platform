import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';

describe('Submissions', () => {
  let token, widgetId;

  before(async () => {
    const email = `submitter_${Date.now()}@example.com`;
    const res = await request(app).post('/auth/register').send({ email, password: 'password123' });
    token = res.body.token;

    const widgetRes = await request(app)
      .post('/widgets')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'signup_form', title: 'Submission Test Widget', fields: [] });
    widgetId = widgetRes.body.id;
  });

  test('valid submission is accepted', async () => {
    const res = await request(app)
      .post('/submissions')
      .send({ widget_id: widgetId, data: { email: 'visitor@example.com' } });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.spam, false);
  });

  test('malformed payload is rejected with 400, not 500', async () => {
    const res = await request(app)
      .post('/submissions')
      .send({ widget_id: 'not-a-number', data: {} });

    assert.strictEqual(res.status, 400);
  });

  test('oversized payload is rejected with 400', async () => {
    const tooManyFields = {};
    for (let i = 0; i < 25; i++) tooManyFields[`field${i}`] = 'value';

    const res = await request(app)
      .post('/submissions')
      .send({ widget_id: widgetId, data: tooManyFields });

    assert.strictEqual(res.status, 400);
  });

  test('honeypot field triggers spam flag but still returns success', async () => {
    const res = await request(app)
      .post('/submissions')
      .send({ widget_id: widgetId, data: { email: 'bot@spam.com' }, website: 'http://spam.com' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.spam, true);
  });

  test('CORS preflight (OPTIONS) is handled correctly', async () => {
    const res = await request(app)
      .options('/submissions')
      .set('Origin', 'http://localhost:5500')
      .set('Access-Control-Request-Method', 'POST');

    assert.strictEqual(res.status, 204);
    assert.ok(res.headers['access-control-allow-origin']);
  });
});
