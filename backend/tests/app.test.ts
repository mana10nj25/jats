import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/database';

describe('JATS API persistence', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    process.env.JWT_SECRET = 'test-secret';
    await connectDatabase();
  });

  afterEach(async () => {
    const connection = mongoose.connection;
    if (connection.readyState === 1) {
      await connection.db?.dropDatabase();
    }
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongoServer.stop();
  });

  it('returns health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('registers a user via API and persists it', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'demo@example.com',
      password: 'SuperSecure123!'
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toMatchObject({ email: 'demo@example.com' });
  });

  it('allows authenticated job creation tied to user', async () => {
    const registerResponse = await request(app).post('/api/auth/register').send({
      email: 'jobs@example.com',
      password: 'SuperSecure123!'
    });

    const token = registerResponse.body.token as string;

    const createResponse = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: 'Acme Corp',
        title: 'Frontend Engineer',
        status: 'applied'
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty('job._id');

    const listResponse = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.jobs).toHaveLength(1);
  });

  it('updates job status separately', async () => {
    const registerResponse = await request(app).post('/api/auth/register').send({
      email: 'status@example.com',
      password: 'SuperSecure123!'
    });

    const token = registerResponse.body.token as string;

    const createResponse = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: 'Acme Corp',
        title: 'Backend Engineer',
        status: 'applied'
      });

    const jobId = createResponse.body.job._id as string;

    const updateResponse = await request(app)
      .patch(`/api/jobs/${jobId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'interview' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.job.status).toBe('interview');
  });
});
