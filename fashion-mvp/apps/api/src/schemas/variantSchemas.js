import { z } from 'zod';

export const hexColor = z.string().regex(/^#([0-9a-fA-F]{6})$/, 'color_hex debe ser #RRGGBB');

export const VariantCreateSchema = z.object({
  size: z.string().min(1),
  color_hex: hexColor.optional(),
  stock: z.number().int().min(0).default(0),
  price: z.number().int().min(0), // centavos
});

export const VariantUpdateSchema = VariantCreateSchema.partial();

export const IdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const ProductIdParamSchema = z.object({
  productId: z.coerce.number().int().min(1),
});
