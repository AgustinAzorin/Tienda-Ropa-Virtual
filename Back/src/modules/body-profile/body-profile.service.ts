import { NotFoundError, ValidationError } from '@/lib/errors';
import { BodyProfileRepository } from './body-profile.repository';
import type { IBodyProfileService, SuggestedSize } from './interfaces/IBodyProfileService';
import type { BodyProfile } from '@/models/users/BodyProfile';
import type { UpsertBodyProfileDto } from './interfaces/IBodyProfileRepository';

// ── Validation constants ──────────────────────────────────────────────────────
const RANGES: Partial<Record<keyof UpsertBodyProfileDto, [number, number]>> = {
  height_cm:         [50, 250],
  weight_kg:         [20, 300],
  chest_cm:          [50, 200],
  waist_cm:          [40, 200],
  hips_cm:           [50, 200],
  shoulder_width_cm: [25, 80],
  inseam_cm:         [40, 120],
  muscle_mass_level: [1, 5],
};

export class BodyProfileService implements IBodyProfileService {
  constructor(private readonly repo = new BodyProfileRepository()) {}

  async getByUserId(userId: string): Promise<BodyProfile> {
    const bp = await this.repo.findByUserId(userId);
    if (!bp) throw new NotFoundError('Perfil corporal');
    return bp;
  }

  async upsert(userId: string, dto: UpsertBodyProfileDto): Promise<BodyProfile> {
    // Validate ranges
    for (const [field, [min, max]] of Object.entries(RANGES)) {
      const val = dto[field as keyof UpsertBodyProfileDto] as number | undefined;
      if (val !== undefined && (val < min || val > max)) {
        throw new ValidationError(`${field} debe estar entre ${min} y ${max}`);
      }
    }
    return this.repo.upsert(userId, dto);
  }

  async suggestSize(userId: string, _productId?: string): Promise<SuggestedSize> {
    const bp = await this.getByUserId(userId);

    // Simple rule-based sizing by chest circumference for tops
    // In production, this would query product variant size charts
    const chest = Number(bp.chest_cm);
    let size = 'M';
    if      (chest < 86)  size = 'XS';
    else if (chest < 92)  size = 'S';
    else if (chest < 100) size = 'M';
    else if (chest < 108) size = 'L';
    else if (chest < 116) size = 'XL';
    else                  size = 'XXL';

    return { size, confidence: 'approximate', note: 'Basado en contorno de pecho' };
  }

  async snapshot(userId: string): Promise<UpsertBodyProfileDto> {
    const bp = await this.getByUserId(userId);
    return {
      height_cm:         bp.height_cm ?? undefined,
      weight_kg:         bp.weight_kg ?? undefined,
      chest_cm:          bp.chest_cm ?? undefined,
      waist_cm:          bp.waist_cm ?? undefined,
      hips_cm:           bp.hips_cm ?? undefined,
      shoulder_width_cm: bp.shoulder_width_cm ?? undefined,
      inseam_cm:         bp.inseam_cm ?? undefined,
      skin_tone:         bp.skin_tone ?? undefined,
      muscle_mass_level: bp.muscle_mass_level ?? undefined,
      age_appearance:    bp.age_appearance ?? undefined,
      gender_expression: bp.gender_expression ?? undefined,
    };
  }

  async delete(userId: string): Promise<void> {
    await this.repo.delete(userId);
  }
}

export const bodyProfileService = new BodyProfileService();
