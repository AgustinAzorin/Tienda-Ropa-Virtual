import type { CreateOutfitDto, OutfitWithItems, UpdateOutfitDto } from './IOutfitsRepository';

export interface IOutfitsService {
  create(dto: CreateOutfitDto): Promise<OutfitWithItems>;
  listByUser(userId: string): Promise<OutfitWithItems[]>;
  update(outfitId: string, userId: string, dto: UpdateOutfitDto): Promise<OutfitWithItems>;
  remove(outfitId: string, userId: string): Promise<void>;
}
