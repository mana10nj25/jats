import request from 'supertest';
import app from '../src/app';

describe('API docs', () => {
  it('serves the Swagger UI', async () => {
    const response = await request(app).get('/api/docs/');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
  });

  it('returns the OpenAPI document', async () => {
    const response = await request(app).get('/api/docs.json');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('openapi', '3.0.3');
    expect(response.body.paths).toHaveProperty('/api/health');
  });
});
