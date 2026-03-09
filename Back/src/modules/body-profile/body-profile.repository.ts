import { db } from '@/db/client';
import { bodyProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { BodyProfile } from '@/models/users/BodyProfile';
import type { IBodyProfileRepository, UpsertBodyProfileDto } from './interfaces/IBodyProfileRepository';

export class BodyProfileRepository implements IBodyProfileRepository {

  private toDbDto(dto: UpsertBodyProfileDto): {
    height_cm?: string;
    weight_kg?: string;
    chest_cm?: string;
    waist_cm?: string;
    hips_cm?: string;
    shoulder_width_cm?: string;
    inseam_cm?: string;
    skin_tone?: string;
    muscle_mass_level?: number;
    age_appearance?: number;
    gender_expression?: string;
  } {
    const asNumeric = (v?: string | number) => (v === undefined || v === null ? undefined : String(v));
    const asInteger = (v?: string | number) => (v === undefined || v === null ? undefined : Math.trunc(Number(v)));

    return {
      height_cm: asNumeric(dto.height_cm),
      weight_kg: asNumeric(dto.weight_kg),
      chest_cm: asNumeric(dto.chest_cm),
      waist_cm: asNumeric(dto.waist_cm),
      hips_cm: asNumeric(dto.hips_cm),
      shoulder_width_cm: asNumeric(dto.shoulder_width_cm),
      inseam_cm: asNumeric(dto.inseam_cm),
      skin_tone: dto.skin_tone,
      muscle_mass_level: asInteger(dto.muscle_mass_level),
      age_appearance: asInteger(dto.age_appearance),
      gender_expression: dto.gender_expression,
    };
  }

  async findByUserId(userId: string): Promise<BodyProfile | null> {
    const [row] = await db.select().from(bodyProfiles).where(eq(bodyProfiles.user_id, userId)).limit(1);
    return (row as unknown as BodyProfile) ?? null;
  }

  async upsert(userId: string, dto: UpsertBodyProfileDto): Promise<BodyProfile> {
    const dbDto = this.toDbDto(dto);
    const [row] = await db.insert(bodyProfiles)
      .values({ user_id: userId, ...dbDto, updated_at: new Date() })
      .onConflictDoUpdate({
        target: bodyProfiles.user_id,
        set: { ...dbDto, updated_at: new Date() },
      })
      .returning();
    return row as unknown as BodyProfile;
  }

  async updateAvatarModelUrl(userId: string, url: string): Promise<void> {
    await db.update(bodyProfiles)
      .set({ avatar_model_url: url, updated_at: new Date() })
      .where(eq(bodyProfiles.user_id, userId));
  }

  async delete(userId: string): Promise<void> {
    await db.delete(bodyProfiles).where(eq(bodyProfiles.user_id, userId));
  }
}
