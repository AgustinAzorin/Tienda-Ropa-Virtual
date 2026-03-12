import { ValidationError } from '@/lib/errors';
import type { OutfitsRepository } from './outfits.repository';
import { outfitsRepository } from './outfits.repository';
import type { IOutfitsService } from './interfaces/IOutfitsService';
import type { CreateOutfitDto, OutfitWithItems, UpdateOutfitDto } from './interfaces/IOutfitsRepository';

export class OutfitsService implements IOutfitsService {
  constructor(private readonly repo: OutfitsRepository = outfitsRepository) {}

  async create(dto: CreateOutfitDto): Promise<OutfitWithItems> {
    if (!dto.name?.trim()) throw new ValidationError('name es requerido');
    if (!dto.items || dto.items.length === 0) throw new ValidationError('items es requerido');
    return this.repo.create({
      ...dto,
      name: dto.name.trim(),
    });
  }

  async listByUser(userId: string): Promise<OutfitWithItems[]> {
    return this.repo.listByUser(userId);
  }

  async update(outfitId: string, userId: string, dto: UpdateOutfitDto): Promise<OutfitWithItems> {
    if (dto.name !== undefined && !dto.name.trim()) {
      throw new ValidationError('name no puede ser vacio');
    }

    return this.repo.update(outfitId, userId, {
      ...dto,
      name: dto.name?.trim(),
    });
  }

  async remove(outfitId: string, userId: string): Promise<void> {
    return this.repo.remove(outfitId, userId);
  }
}

export const outfitsService = new OutfitsService();
