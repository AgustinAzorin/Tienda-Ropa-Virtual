import type { Outfit, OutfitItem } from '@/models/social';

export interface CreateOutfitItemDto {
  product_id: string;
  variant_id?: string | null;
  sort_order?: number;
}

export interface CreateOutfitDto {
  userId: string;
  name: string;
  is_public?: boolean;
  items: CreateOutfitItemDto[];
}

export interface UpdateOutfitDto {
  name?: string;
  is_public?: boolean;
  items?: CreateOutfitItemDto[];
}

export interface OutfitWithItems {
  outfit: Outfit;
  items: OutfitItem[];
}

export interface IOutfitsRepository {
  create(dto: CreateOutfitDto): Promise<OutfitWithItems>;
  listByUser(userId: string): Promise<OutfitWithItems[]>;
  update(outfitId: string, userId: string, dto: UpdateOutfitDto): Promise<OutfitWithItems>;
  remove(outfitId: string, userId: string): Promise<void>;
}
