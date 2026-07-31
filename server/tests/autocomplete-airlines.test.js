const request = require('supertest');
const mysql = require('mysql2/promise');
const app = require('../app');

const pool = mysql.createPool();

describe('GET /api/users/autocomplete/airlines', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an empty array without querying the database when query is blank', async () => {
    const res = await request(app).get('/api/users/autocomplete/airlines').query({ query: '  ' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('returns matching airlines for a query', async () => {
    const fakeRows = [{ code: 'UA', name: 'United Airlines' }];
    pool.query.mockResolvedValueOnce([fakeRows]);

    const res = await request(app).get('/api/users/autocomplete/airlines').query({ query: 'united' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeRows);
  });

  it('returns 500 when the database query fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('db exploded'));

    const res = await request(app).get('/api/users/autocomplete/airlines').query({ query: 'united' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Airline autocomplete failed' });
  });
});
