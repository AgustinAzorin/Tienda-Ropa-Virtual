/** Perfil corporal para el probador 3D */
export interface BodyProfile {
  id: string; // uuid PK
  user_id: string; // uuid FK → users.id
  height_cm: number | null;
  weight_kg: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  shoulder_width_cm: number | null;
  inseam_cm: number | null;
  skin_tone: string | null;
  /** URL del modelo GLTF generado/guardado en Supabase Storage */
  avatar_model_url: string | null;
  /** Nivel de masa muscular (1–5), mapea al slider de Anny */
  muscle_mass_level: number | null; // 1–5
  /** Apariencia de edad percibida */
  age_appearance: number | null;
  /** Expresión de género, mapea al slider de Anny */
  gender_expression: string | null;
  updated_at: string; // timestamptz
}
