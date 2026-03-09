import { NotFoundError, ValidationError } from '@/lib/errors';
import { BodyProfileRepository } from './body-profile.repository';
import type { IBodyProfileService, SuggestedSize } from './interfaces/IBodyProfileService';
import type { BodyProfile } from '@/models/users/BodyProfile';
import type { UpsertBodyProfileDto } from './interfaces/IBodyProfileRepository';
import type { BodyProfileSnapshot } from '@/models/tryon/TryonSession';

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

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }

  async getByUserId(userId: string): Promise<BodyProfile> {
    const bp = await this.repo.findByUserId(userId);
    if (!bp) throw new NotFoundError('Perfil corporal');
    return bp;
  }

  async upsert(userId: string, dto: UpsertBodyProfileDto): Promise<BodyProfile> {
    // Validate ranges
    for (const [field, [min, max]] of Object.entries(RANGES)) {
      const raw = dto[field as keyof UpsertBodyProfileDto];
      const val = this.toOptionalNumber(raw);
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

  async snapshot(userId: string): Promise<BodyProfileSnapshot> {
    const bp = await this.getByUserId(userId);
    return {
      height_cm:         this.toOptionalNumber(bp.height_cm) ?? null,
      weight_kg:         this.toOptionalNumber(bp.weight_kg) ?? null,
      chest_cm:          this.toOptionalNumber(bp.chest_cm) ?? null,
      waist_cm:          this.toOptionalNumber(bp.waist_cm) ?? null,
      hips_cm:           this.toOptionalNumber(bp.hips_cm) ?? null,
      shoulder_width_cm: this.toOptionalNumber(bp.shoulder_width_cm) ?? null,
      inseam_cm:         this.toOptionalNumber(bp.inseam_cm) ?? null,
      skin_tone:         bp.skin_tone ?? null,
      muscle_mass_level: this.toOptionalNumber(bp.muscle_mass_level) ?? null,
      age_appearance:    this.toOptionalNumber(bp.age_appearance) ?? null,
      gender_expression: bp.gender_expression ?? null,
    };
  }

  async delete(userId: string): Promise<void> {
    await this.repo.delete(userId);
  }
}

export const bodyProfileService = new BodyProfileService();
