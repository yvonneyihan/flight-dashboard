jest.mock('axios');

const request = require('supertest');
const axios = require('axios');
const app = require('../app');

describe('POST /api/predictions/price', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/predictions/price')
      .send({ departure: 'JFK', arrival: 'LAX' }); // missing departureDate

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('returns the ML service prediction on success', async () => {
    const fakePrediction = {
      predicted_price: 250.5,
      confidence: 0.9,
      prediction_details: { method: 'hybrid_ai' },
    };
    axios.post.mockResolvedValueOnce({ data: fakePrediction });

    const res = await request(app)
      .post('/api/predictions/price')
      .send({ departure: 'JFK', arrival: 'LAX', departureDate: '2026-08-15' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, prediction: fakePrediction });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('returns 503 when the ML service is unreachable', async () => {
    const err = new Error('connect ECONNREFUSED');
    err.code = 'ECONNREFUSED';
    // cacheWrapper retries the fetch function once on error, so the
    // outage must persist across both calls to surface as ECONNREFUSED.
    axios.post.mockRejectedValue(err);

    const res = await request(app)
      .post('/api/predictions/price')
      .send({ departure: 'ORD', arrival: 'SFO', departureDate: '2026-09-01' });

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('ML service unavailable');
  });
});
