/** Snapshot de medidas corporales capturadas al inicio de la sesión */
export interface BodyProfileSnapshot {
  height_cm: number | null;
  weight_kg: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  shoulder_width_cm: number | null;
  inseam_cm: number | null;
  skin_tone: string | null;
  muscle_mass_level: number | null;
  age_appearance: number | null;
  gender_expression: string | null;
}

/** Sesión del probador 3D */
export interface TryonSession {
  id: string; // uuid PK
  /** nullable para guest */
  user_id: string | null; // uuid FK → users.id
  product_id: string; // uuid FK → products.id
  variant_id: string; // uuid FK → product_variants.id
  /** Copia de las medidas corporales al momento de la sesión */
  body_profile_snapshot: BodyProfileSnapshot | null; // jsonb
  duration_seconds: number | null;
  converted_to_cart: boolean;
  converted_to_purchase: boolean;
  created_at: string; // timestamptz
}
