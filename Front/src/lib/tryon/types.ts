export type DeviceTier = 'high' | 'mid' | 'low';

export interface BodyProfile {
  id: string;
  user_id: string;
  height_cm: number | string | null;
  weight_kg: number | string | null;
  chest_cm: number | string | null;
  waist_cm: number | string | null;
  hips_cm: number | string | null;
  shoulder_width_cm: number | string | null;
  inseam_cm: number | string | null;
  skin_tone: string | null;
  avatar_model_url: string | null;
  updated_at?: string | Date;
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  size?: string | null;
  color?: string | null;
  color_hex?: string | null;
  stock?: number;
}

export interface Product3DTexture {
  id: string;
  asset_id: string;
  type: 'diffuse' | 'normal' | 'roughness' | 'metalness' | string;
  url: string;
  lod_level?: number;
}

export interface ProductFitAnchor {
  id?: string;
  asset_id?: string;
  anchor_name: string;
  x: number | string;
  y: number | string;
  z: number | string;
}

export interface Product3DAsset {
  id: string;
  product_id: string;
  variant_id: string | null;
  model_url: string;
  draco_compressed: boolean;
  textures?: Product3DTexture[];
  fit_anchors?: ProductFitAnchor[];
}

export interface ProductImage {
  id?: string;
  url: string;
  alt_text?: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  has_3d_model: boolean;
  price?: number | string;
  currency?: string;
  variants: ProductVariant[];
  images?: ProductImage[];
  assets_3d?: Product3DAsset[];
}

export interface TryonSession {
  id: string;
  user_id: string | null;
  product_id: string;
  variant_id: string;
  body_profile_snapshot: Record<string, unknown> | null;
  duration_seconds: number | null;
  converted_to_cart: boolean;
  converted_to_purchase: boolean;
  created_at: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  is_public: boolean;
  created_at: string;
}

export interface OutfitItem {
  id: string;
  outfit_id: string;
  product_id: string;
  variant_id: string | null;
  sort_order: number;
  product?: Product;
}

export interface SaveItem {
  id: string;
  product_id: string | null;
  post_id: string | null;
  collection_name: string;
  created_at: string;
  product?: Product;
}
