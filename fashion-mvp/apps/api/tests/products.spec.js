import request from 'supertest';
import { describe, it, expect } from 'vitest';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Products listing', () => {
  it('GET /api/products → 200 y estructura de paginado', async () => {
    const res = await request(BASE).get('/api/products?page=1&limit=5').expect(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('limit', 5);
  });

  it('GET /api/products con filtros básicos', async () => {
    const url = '/api/products?category=shoes&style=casual&season=summer&q=zap';
    const res = await request(BASE).get(url).expect(200);
    expect(res.body).toHaveProperty('items');
  });

  it('GET /api/products con rango de precio y orden por precio asc', async () => {
    const res = await request(BASE)
      .get('/api/products?minPrice=1000&maxPrice=500000&sort=price_asc')
      .expect(200);
    expect(res.body).toHaveProperty('items');
  });

  it('GET /api/products valida minPrice<=maxPrice', async () => {
    const res = await request(BASE)
      .get('/api/products?minPrice=5000&maxPrice=1000')
      .expect(400);
    expect(res.body).toHaveProperty('error', 'ValidationError');
  });
});
