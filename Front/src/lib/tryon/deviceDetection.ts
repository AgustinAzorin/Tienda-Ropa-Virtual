import type { DeviceTier } from './types';

const CACHE_KEY = 'anya_tryon_device_tier_v1';

interface DetectionResult {
  tier: DeviceTier;
  score: number;
  checkedAt: number;
}

function benchmarkWebGL(): number {
  if (typeof window === 'undefined') return 0;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  });

  if (!gl) return 0;

  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';

  let score = 0;
  if (typeof renderer === 'string') {
    const r = renderer.toLowerCase();
    if (r.includes('apple') || r.includes('nvidia') || r.includes('radeon')) score += 40;
    if (r.includes('intel')) score += 20;
    if (r.includes('adreno') || r.includes('mali')) score += 10;
  }

  const textureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE) ?? 0);
  if (textureSize >= 8192) score += 30;
  else if (textureSize >= 4096) score += 20;
  else score += 10;

  const maxVertexUniforms = Number(gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) ?? 0);
  if (maxVertexUniforms >= 1024) score += 20;
  else if (maxVertexUniforms >= 512) score += 12;
  else score += 6;

  return score;
}

function fromScore(score: number): DeviceTier {
  if (score >= 90) return 'high';
  if (score >= 55) return 'mid';
  return 'low';
}

export function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
}

export function getCachedDeviceTier(): DeviceTier | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as DetectionResult;
    if (Date.now() - parsed.checkedAt > 1000 * 60 * 60 * 24 * 30) return null;
    return parsed.tier;
  } catch {
    return null;
  }
}

export function detectDeviceTier(force = false): DeviceTier {
  if (typeof window === 'undefined') return 'mid';

  if (!force) {
    const cached = getCachedDeviceTier();
    if (cached) return cached;
  }

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const webglScore = benchmarkWebGL();

  let score = webglScore;
  if (memory >= 8) score += 25;
  else if (memory >= 4) score += 15;
  else if (memory >= 2) score += 8;

  if (cores >= 8) score += 20;
  else if (cores >= 4) score += 12;
  else score += 5;

  const tier = fromScore(score);
  const payload: DetectionResult = { tier, score, checkedAt: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  return tier;
}
