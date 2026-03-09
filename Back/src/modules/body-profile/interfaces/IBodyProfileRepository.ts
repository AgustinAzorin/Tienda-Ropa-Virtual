import type { BodyProfile } from '@/models/users/BodyProfile';

export interface UpsertBodyProfileDto {
  height_cm?:          number | string;
  weight_kg?:          number | string;
  chest_cm?:           number | string;
  waist_cm?:           number | string;
  hips_cm?:            number | string;
  shoulder_width_cm?:  number | string;
  inseam_cm?:          number | string;
  skin_tone?:          string;
  muscle_mass_level?:  number | string;
  age_appearance?:     number | string;
  gender_expression?:  string;
}

export interface IBodyProfileRepository {
  findByUserId(userId: string): Promise<BodyProfile | null>;
  upsert(userId: string, dto: UpsertBodyProfileDto): Promise<BodyProfile>;
  updateAvatarModelUrl(userId: string, url: string): Promise<void>;
  delete(userId: string): Promise<void>;
}
