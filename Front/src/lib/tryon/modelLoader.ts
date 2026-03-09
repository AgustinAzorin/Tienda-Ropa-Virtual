import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { DeviceTier, Product3DAsset, Product3DTexture } from './types';

let dracoLoader: DRACOLoader | null = null;
let gltfLoader: GLTFLoader | null = null;

function getDracoLoader() {
  if (!dracoLoader) {
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    dracoLoader.setDecoderConfig({ type: 'wasm' });
    dracoLoader.preload();
  }
  return dracoLoader;
}

function getGLTFLoader() {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(getDracoLoader());
  }
  return gltfLoader;
}

function isSafeStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const envHost = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;

    const validHost = envHost
      ? parsed.hostname === envHost
      : parsed.hostname.endsWith('.supabase.co');

    return validHost && parsed.pathname.includes('/storage/v1/object/public/');
  } catch {
    return false;
  }
}

export function pickTextureForTier(
  textures: Product3DTexture[] | undefined,
  type: Product3DTexture['type'],
  tier: DeviceTier,
): Product3DTexture | null {
  if (!textures?.length) return null;

  const desiredLevel = tier === 'high' ? 0 : tier === 'mid' ? 1 : 2;
  const candidates = textures.filter((item) => item.type === type);
  if (!candidates.length) return null;

  const exact = candidates.find((item) => (item.lod_level ?? 0) === desiredLevel);
  if (exact) return exact;

  // Fallback to the closest available LOD.
  return candidates
    .slice()
    .sort((a, b) => Math.abs((a.lod_level ?? 0) - desiredLevel) - Math.abs((b.lod_level ?? 0) - desiredLevel))[0];
}

export function selectAssetForVariant(
  assets: Product3DAsset[] | undefined,
  variantId: string | null | undefined,
): Product3DAsset | null {
  if (!assets?.length) return null;
  if (variantId) {
    const byVariant = assets.find((asset) => asset.variant_id === variantId);
    if (byVariant) return byVariant;
  }
  return assets[0] ?? null;
}

export function loadGltfModel(
  modelUrl: string,
  options?: {
    onProgress?: (percent: number) => void;
  },
): Promise<GLTF> {
  if (!isSafeStorageUrl(modelUrl)) {
    return Promise.reject(new Error('URL de modelo no permitida.'));
  }

  const loader = getGLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      modelUrl,
      (gltf) => resolve(gltf),
      (event) => {
        if (!options?.onProgress) return;
        if (!event.total) {
          options.onProgress(0);
          return;
        }
        options.onProgress(Math.round((event.loaded / event.total) * 100));
      },
      (error) => reject(error),
    );
  });
}

export function disposeObject3DResources(root: GLTF['scene']) {
  root.traverse((obj) => {
    const mesh = obj as {
      geometry?: { dispose: () => void };
      material?: { dispose: () => void } | Array<{ dispose: () => void }>;
    };

    if (mesh.geometry) mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => material.dispose());
    } else if (mesh.material) {
      mesh.material.dispose();
    }
  });
}
