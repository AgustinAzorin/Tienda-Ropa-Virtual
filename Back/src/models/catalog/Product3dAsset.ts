/** Asset 3D de un producto (GLTF/GLB en Supabase Storage) */
export interface Product3dAsset {
  id: string; // uuid PK
  product_id: string; // uuid FK → products.id
  /** nullable — puede aplicar a una variante específica */
  variant_id: string | null; // uuid FK → product_variants.id
  /** URL del modelo GLTF/GLB en Supabase Storage */
  model_url: string;
  draco_compressed: boolean;
  created_at: string; // timestamptz
}
