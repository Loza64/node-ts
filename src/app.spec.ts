/// <reference types="jest" />

import request from 'supertest';
import { createApp } from './app';

describe('app', () => {
  const app = createApp();

  it('GET /api/health/hello returns 200 and greeting', async () => {
    const res = await request(app).get('/api/health/hello');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'hello server' });
  });

  it('POST /api/users rejects an invalid body', async () => {
    const res = await request(app).post('/api/users').send({ name: 'a' });

    expect(res.status).toBe(400);
  });

  it('POST /api/users creates a user with a valid body', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Loza Dev', email: 'loza@example.com', password: 'supersecret' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Loza Dev', email: 'loza@example.com' });
    expect(res.body.data.passwordHash).toBeUndefined();
  });
});
