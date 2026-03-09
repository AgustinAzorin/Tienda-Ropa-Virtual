import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const handleMedusaWebhookMock = vi.fn();

vi.mock('@/modules/orders/orders.service', () => ({
  orderService: {
    handleMedusaWebhook: handleMedusaWebhookMock,
  },
}));

const { POST } = await import('@/app/api/orders/webhook/route');

describe('POST /api/orders/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('acepta payload directo {id,status}', async () => {
    const req = new NextRequest('http://localhost/api/orders/webhook', {
      method: 'POST',
      body: JSON.stringify({ id: 'm-1', status: 'paid' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual({ received: true });
    expect(handleMedusaWebhookMock).toHaveBeenCalledWith('m-1', 'paid');
  });

  it('acepta payload anidado {data:{id,status}}', async () => {
    const req = new NextRequest('http://localhost/api/orders/webhook', {
      method: 'POST',
      body: JSON.stringify({ data: { id: 'm-2', status: 'shipped' } }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(handleMedusaWebhookMock).toHaveBeenCalledWith('m-2', 'shipped');
  });

  it('rechaza payload sin id', async () => {
    const req = new NextRequest('http://localhost/api/orders/webhook', {
      method: 'POST',
      body: JSON.stringify({ status: 'paid' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(422);
  });

  it('rechaza payload sin status', async () => {
    const req = new NextRequest('http://localhost/api/orders/webhook', {
      method: 'POST',
      body: JSON.stringify({ id: 'm-3' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(422);
  });

  it('rechaza id/status vacios', async () => {
    const req = new NextRequest('http://localhost/api/orders/webhook', {
      method: 'POST',
      body: JSON.stringify({ id: '   ', status: '' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(422);
  });

  it('propaga error del servicio', async () => {
    handleMedusaWebhookMock.mockRejectedValue(new Error('webhook-fail'));

    const req = new NextRequest('http://localhost/api/orders/webhook', {
      method: 'POST',
      body: JSON.stringify({ id: 'm-4', status: 'paid' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(500);
  });
});
