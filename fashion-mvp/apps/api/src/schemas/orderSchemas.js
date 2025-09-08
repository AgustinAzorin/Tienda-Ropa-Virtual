import { z } from 'zod';

export const AddressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(2),
});

export const CreateFromCartSchema = z.object({
  shippingAddress: AddressSchema.optional(),
  notes: z.string().max(500).optional(),
});

export const OrderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const OrderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'cancelled']),
});
