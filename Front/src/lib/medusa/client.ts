import Medusa from '@medusajs/js-sdk';

let medusaClient: Medusa | null = null;

export function getMedusaClient() {
  if (medusaClient) return medusaClient;

  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_MEDUSA_BACKEND_URL no esta configurada');
  }

  medusaClient = new Medusa({ baseUrl } as never);
  return medusaClient;
}
