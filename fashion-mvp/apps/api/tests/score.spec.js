import request from 'supertest';
import { describe, it, expect } from 'vitest';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Score proxy', () => {
  it('POST /api/outfits/score → maneja timeout o respuesta', async () => {
    const payload = { items: [] }; // payload mínimo
    const res = await request(BASE).post('/api/outfits/score').send(payload);
    expect([200, 502, 504]).toContain(res.status);
  });
});
