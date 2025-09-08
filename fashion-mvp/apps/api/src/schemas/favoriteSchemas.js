import { z } from 'zod';

export const FavoriteParamSchema = z.object({
  productId: z.coerce.number().int().positive(),
});
