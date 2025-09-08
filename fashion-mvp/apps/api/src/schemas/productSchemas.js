import { z } from 'zod';

export const ProductCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  base_color_hex: z.string().regex(/^#([0-9a-fA-F]{6})$/).optional(),
  style: z.string().optional(),
  occasion: z.string().optional(),
  season: z.string().optional(),
  category: z.string().min(1),
  material: z.string().optional(),
  variants: z.array(
    z.object({
      size: z.string().min(1),
      color_hex: z.string().regex(/^#([0-9a-fA-F]{6})$/).optional(),
      stock: z.number().int().min(0).default(0),
      price: z.number().int().min(0)
    })
  ).optional()
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().min(1).optional(),
  style: z.string().min(1).optional(),
  season: z.string().min(1).optional(),
  q: z.string().min(1).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).optional()
}).refine((v) => {
  if (v.minPrice != null && v.maxPrice != null) {
    return v.minPrice <= v.maxPrice;
  }
  return true;
}, { message: 'minPrice must be <= maxPrice' });
