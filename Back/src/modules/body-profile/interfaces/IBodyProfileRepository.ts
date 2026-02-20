import type { BodyProfile } from '@/models/users/BodyProfile';

export interface UpsertBodyProfileDto {
  height_cm?:          number;
  weight_kg?:          number;
  chest_cm?:           number;
  waist_cm?:           number;
  hips_cm?:            number;
  shoulder_width_cm?:  number;
  inseam_cm?:          number;
  skin_tone?:          string;
  muscle_mass_level?:  number;
  age_appearance?:     number;
  gender_expression?:  string;
}

export interface IBodyProfileRepository {
  findByUserId(userId: string): Promise<BodyProfile | null>;
  upsert(userId: string, dto: UpsertBodyProfileDto): Promise<BodyProfile>;
  updateAvatarModelUrl(userId: string, url: string): Promise<void>;
  delete(userId: string): Promise<void>;
}
