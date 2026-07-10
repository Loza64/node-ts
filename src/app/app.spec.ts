/// <reference types="jest" />

import request from 'supertest';
import app from './app';

describe('app', () => {
  it('GET /api/get/hello returns 200 and greeting', async () => {
    const res = await request(app).get('/api/get/hello');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'hello server' });
  });

  it('POST /api/post/users rejects an invalid body', async () => {
    const res = await request(app).post('/api/post/users').send({ name: 'a' });

    expect(res.status).toBe(400);
  });
});
