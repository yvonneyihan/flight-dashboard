const request = require('supertest');
const mysql = require('mysql2/promise');
const redis = require('redis');
const app = require('../app');

const pool = mysql.createPool();
const redisClient = redis.createClient();

describe('GET /health', () => {
  it('returns 200 and a healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('uptime');
  });
});

describe('GET /health/detailed', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 when database and redis are both reachable', async () => {
    pool.query.mockResolvedValueOnce([[{ 1: 1 }]]);
    redisClient.ping.mockResolvedValueOnce('PONG');

    const res = await request(app).get('/health/detailed');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.checks).toEqual({ database: 'healthy', redis: 'healthy' });
  });

  it('returns 503 when the database check fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection lost'));
    redisClient.ping.mockResolvedValueOnce('PONG');

    const res = await request(app).get('/health/detailed');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('unhealthy');
    expect(res.body.checks.database).toBe('unhealthy');
  });

  it('returns 503 when redis is unreachable', async () => {
    pool.query.mockResolvedValueOnce([[{ 1: 1 }]]);
    redisClient.ping.mockRejectedValueOnce(new Error('redis down'));

    const res = await request(app).get('/health/detailed');

    expect(res.status).toBe(503);
    expect(res.body.checks.redis).toBe('unhealthy');
  });
});
