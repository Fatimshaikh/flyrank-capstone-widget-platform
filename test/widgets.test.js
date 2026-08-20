import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';

describe('Widgets', () => {
  let tokenA, tokenB, widgetId;

  before(async () => {
    const emailA = `tenantA_${Date.now()}@example.com`;
    const emailB = `tenantB_${Date.now()}@example.com`;

    const resA = await request(app).post('/auth/register').send({ email: emailA, password: 'password123' });
    tokenA = resA.body.token;

    const resB = await request(app).post('/auth/register').send({ email: emailB, password: 'password123' });
    tokenB = resB.body.token;
  });

  test('authenticated user can create a widget', async () => {
    const res = await request(app)
      .post('/widgets')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ type: 'signup_form', title: 'Test Widget', fields: [] });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.id);
    assert.ok(res.body.embed_snippet);
    widgetId = res.body.id;
  });

  test('unauthenticated request is rejected with 401', async () => {
    const res = await request(app).get('/widgets');
    assert.strictEqual(res.status, 401);
  });

  test('tenant B cannot access tenant A widget by id', async () => {
    const res = await request(app)
      .get(`/widgets/${widgetId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert.strictEqual(res.status, 404);
  });

  test('tenant B widget list does not include tenant A widget', async () => {
    const res = await request(app)
      .get('/widgets')
      .set('Authorization', `Bearer ${tokenB}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.find(w => w.id === widgetId), undefined);
  });
});
