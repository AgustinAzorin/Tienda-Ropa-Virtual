import request from 'supertest';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Health', () => {
  it('GET /api/health → 200 y payload básico', async () => {
    const res = await request(BASE).get('/api/health').expect(200);
    expect(res.body).toMatchObject({ ok: true });
    expect(typeof res.body.uptime_s).toBe('number');
    expect(res.body.version).toBeDefined();
  });
});
