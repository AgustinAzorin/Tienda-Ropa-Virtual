/** Punto de anclaje 3D para posicionar la prenda sobre el maniquí (sustituye fit_anchors jsonb) */
export interface ProductFitAnchor {
  id: string; // uuid PK
  asset_id: string; // uuid FK → product_3d_assets.id
  anchor_name: string; // ej: 'shoulder_left', 'waist', 'hem'
  x: number;
  y: number;
  z: number;
}
