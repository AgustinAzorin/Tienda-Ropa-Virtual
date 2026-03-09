'use client';

import { BodySlider } from '@/components/ui/BodySlider';
import { Button } from '@/components/ui/Button';
import type { BodyProfile } from '@/lib/tryon/types';

interface BodySlidersProps {
  bodyProfile: BodyProfile;
  onChange: (updated: Partial<BodyProfile>) => void;
  onSave: () => void;
}

function asNumber(value: number | string | null | undefined, fallback: number): number {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function BodySliders({ bodyProfile, onChange, onSave }: BodySlidersProps) {
  return (
    <aside className="glass w-full max-w-sm space-y-4 rounded-r-[14px] p-4 md:h-full md:max-w-none md:rounded-none md:rounded-r-[14px]">
      <h3 className="font-display text-xl italic">Ajustar figura</h3>

      <BodySlider label="Altura" value={asNumber(bodyProfile.height_cm, 165)} min={140} max={210} unit="cm" onChange={(value) => onChange({ height_cm: value })} />
      <BodySlider label="Peso" value={asNumber(bodyProfile.weight_kg, 65)} min={40} max={150} unit="kg" onChange={(value) => onChange({ weight_kg: value })} />
      <BodySlider label="Pecho" value={asNumber(bodyProfile.chest_cm, 88)} min={60} max={130} unit="cm" onChange={(value) => onChange({ chest_cm: value })} />
      <BodySlider label="Cintura" value={asNumber(bodyProfile.waist_cm, 72)} min={55} max={120} unit="cm" onChange={(value) => onChange({ waist_cm: value })} />
      <BodySlider label="Cadera" value={asNumber(bodyProfile.hips_cm, 96)} min={65} max={135} unit="cm" onChange={(value) => onChange({ hips_cm: value })} />
      <BodySlider label="Hombros" value={asNumber(bodyProfile.shoulder_width_cm, 42)} min={30} max={60} unit="cm" onChange={(value) => onChange({ shoulder_width_cm: value })} />

      <Button fullWidth onClick={onSave}>Guardar medidas</Button>
    </aside>
  );
}
