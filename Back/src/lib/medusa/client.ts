import Medusa from '@medusajs/medusa-js';

/**
 * Medusa.js client — handles checkout, payment, shipping, inventory sync.
 * Keep this singleton in module scope for reuse across requests.
 */
export const medusa = new Medusa({
  baseUrl: process.env.MEDUSA_BACKEND_URL ?? 'http://localhost:9000',
  maxRetries: 3,
});
