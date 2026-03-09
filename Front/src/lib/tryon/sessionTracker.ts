import { apiFetch } from '@/lib/api';
import type { BodyProfile, TryonSession } from './types';

interface StartPayload {
  product_id: string;
  variant_id: string;
  bodyProfile?: BodyProfile | null;
}

function toSnapshot(bodyProfile: BodyProfile | null | undefined) {
  if (!bodyProfile) return null;
  return {
    height_cm: bodyProfile.height_cm ?? null,
    weight_kg: bodyProfile.weight_kg ?? null,
    chest_cm: bodyProfile.chest_cm ?? null,
    waist_cm: bodyProfile.waist_cm ?? null,
    hips_cm: bodyProfile.hips_cm ?? null,
    shoulder_width_cm: bodyProfile.shoulder_width_cm ?? null,
    inseam_cm: bodyProfile.inseam_cm ?? null,
    skin_tone: bodyProfile.skin_tone ?? null,
  };
}

export async function startTryonSession(payload: StartPayload): Promise<TryonSession> {
  return apiFetch<TryonSession>('/api/tryon/sessions', {
    method: 'POST',
    body: JSON.stringify({
      productId: payload.product_id,
      variantId: payload.variant_id,
      bodyProfileSnapshot: toSnapshot(payload.bodyProfile),
    }),
  });
}

export async function finishTryonSession(sessionId: string, durationSeconds: number) {
  return apiFetch<TryonSession>(`/api/tryon/sessions/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify(durationSeconds),
  });
}

export async function markTryonSessionAsCartConverted(sessionId: string) {
  return apiFetch<TryonSession>(`/api/tryon/sessions/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify({ convertedToCart: true }),
  });
}
