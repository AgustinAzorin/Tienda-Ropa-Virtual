import type { TryonSession, BodyProfileSnapshot } from '@/models/tryon/TryonSession';

export interface CreateTryonSessionDto {
  userId?:               string;
  productId:             string;
  variantId:             string;
  bodyProfileSnapshot?:  BodyProfileSnapshot;
}

export interface UpdateTryonSessionDto {
  duration_seconds?:      number;
  converted_to_cart?:     boolean;
  converted_to_purchase?: boolean;
}

export interface ITryonRepository {
  create(dto: CreateTryonSessionDto): Promise<TryonSession>;
  update(id: string, dto: UpdateTryonSessionDto): Promise<TryonSession>;
  listByUser(userId: string): Promise<TryonSession[]>;
  conversionStats(since: Date): Promise<{
    total_sessions:   number;
    purchases:        number;
    conversion_rate:  number;
  }>;
}
