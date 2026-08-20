import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';

describe('Auth', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'testpassword123';

  test('POST /auth/register creates a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, testEmail);
    assert.strictEqual(res.body.user.password_hash, undefined); // never leaked
  });

  test('POST /auth/register rejects a duplicate email with 409', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword });

    assert.strictEqual(res.status, 409);
  });

  test('POST /auth/register rejects invalid input with 400', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: '123' });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.details);
  });

  test('POST /auth/login succeeds with correct credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
  });

  test('POST /auth/login rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });

    assert.strictEqual(res.status, 401);
  });
});
