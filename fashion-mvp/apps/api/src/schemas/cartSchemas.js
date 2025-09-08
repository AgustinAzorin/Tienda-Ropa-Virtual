import { z } from 'zod';

export const CartItemUpsertSchema = z.object({
  variantId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const VariantIdParamSchema = z.object({
  variantId: z.coerce.number().int().positive(),
});

export const CartIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
