export type TextureType = 'diffuse' | 'normal' | 'roughness' | 'metalness' | 'emissive' | 'ao';

/** Textura asociada a un asset 3D (sustituye texture_urls jsonb) */
export interface Product3dTexture {
  id: string; // uuid PK
  asset_id: string; // uuid FK → product_3d_assets.id
  type: TextureType;
  url: string;
}
