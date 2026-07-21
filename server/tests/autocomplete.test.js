const request = require('supertest');
const mysql = require('mysql2/promise');
const app = require('../app');

const pool = mysql.createPool();

describe('GET /api/users/autocomplete', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an empty array without querying the database when query is blank', async () => {
    const res = await request(app).get('/api/users/autocomplete').query({ query: '  ' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('returns matching airports for a query', async () => {
    const fakeRows = [{ code: 'JFK', name: "John F. Kennedy International Airport" }];
    pool.query.mockResolvedValueOnce([fakeRows]);

    const res = await request(app).get('/api/users/autocomplete').query({ query: 'jfk' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeRows);
  });

  it('returns 500 when the database query fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('db exploded'));

    const res = await request(app).get('/api/users/autocomplete').query({ query: 'jfk' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Autocomplete failed' });
  });
});
