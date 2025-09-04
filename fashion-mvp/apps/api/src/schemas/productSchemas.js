import { z } from 'zod';

// Regex simple para HEX #RRGGBB
const hexColor = z.string().regex(/^#([0-9a-fA-F]{6})$/, 'color_hex debe ser #RRGGBB');

const VariantSchema = z.object({
  size: z.string().min(1),
  color_hex: hexColor.optional(),
  stock: z.number().int().min(0).default(0),
  price: z.number().int().min(0), // en centavos
});

export const ProductCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  base_color_hex: hexColor.optional(),
  style: z.string().max(50).optional(),
  occasion: z.string().max(50).optional(),
  season: z.string().max(20).optional(),
  category: z.string().min(1).max(50),
  material: z.string().max(80).optional(),
  variants: z.array(VariantSchema).optional(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  style: z.string().optional(),
  season: z.string().optional(),
  q: z.string().optional(),
});

export const IdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
});
