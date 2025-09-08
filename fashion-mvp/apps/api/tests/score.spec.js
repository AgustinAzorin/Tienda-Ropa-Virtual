import request from 'supertest';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Score proxy', () => {
  it('POST /api/outfits/score → maneja timeout o respuesta', async () => {
    const payload = { items: [] }; // payload mínimo
    const res = await request(BASE).post('/api/outfits/score').send(payload);
    // Acepta 200 con data o 5xx si el servicio externo no está disponible
    expect([200, 502, 504]).toContain(res.status);
  });
});
