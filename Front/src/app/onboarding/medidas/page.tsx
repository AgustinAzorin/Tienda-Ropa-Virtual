'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BodySlider } from '@/components/ui/BodySlider';
import { SkinTonePicker, type SkinTone } from '@/components/ui/SkinTonePicker';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ─── SVG Mannequin ────────────────────────────────────────────────────────────

interface MannequinProps {
  height: number;
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  skinTone: SkinTone | null;
}

function Mannequin({ height, chest, waist, hips, shoulders, skinTone }: MannequinProps) {
  // Normalize values to [0,1] for relative proportions
  const h  = (height    - 140) / (210 - 140); // 0 = 140cm, 1 = 210cm
  const c  = (chest     -  60) / (130 -  60);
  const w  = (waist     -  55) / (120 -  55);
  const hip = (hips     -  65) / (135 -  65);
  const sh = (shoulders -  30) / ( 60 -  30);

  // SVG proportions
  const totalH   = 240 + h * 60;           // 240–300px total height
  const headR    = 18;
  const neckW    = 10;
  const shoulderW = 55 + sh * 25;           // 55–80px
  const chestW    = 44 + c * 22;            // 44–66px
  const waistW    = 34 + w * 18;            // 34–52px
  const hipW      = 48 + hip * 24;          // 48–72px
  const legL      = totalH * 0.45;
  const torsoL    = totalH * 0.35;

  const cx       = 80;                       // center x
  const headTop  = 10;
  const headBot  = headTop + headR * 2;
  const neckTop  = headBot;
  const neckBot  = neckTop + 12;
  const torsoTop = neckBot;
  const torsoBot = torsoTop + torsoL;
  const legTop   = torsoBot;
  const legBot   = legTop + legL;

  const fill     = skinTone ?? '#C8895C';
  const stroke   = 'rgba(255,255,255,0.12)';

  return (
    <svg
      viewBox={`0 0 160 ${Math.ceil(legBot + 10)}`}
      className="w-full max-w-[160px] mx-auto transition-all duration-300"
      fill="none"
      aria-label="Preview del maniquí basado en tus medidas"
      role="img"
    >
      {/* Head */}
      <circle
        cx={cx}
        cy={headTop + headR}
        r={headR}
        fill={fill}
        stroke={stroke}
        strokeWidth="1"
      />

      {/* Neck */}
      <rect
        x={cx - neckW / 2}
        y={neckTop}
        width={neckW}
        height={12}
        fill={fill}
        stroke={stroke}
        strokeWidth="0.5"
      />

      {/* Torso as path */}
      <path
        d={`
          M ${cx - shoulderW / 2},${torsoTop}
          Q ${cx - chestW / 2 - 4},${torsoTop + torsoL * 0.25}
            ${cx - waistW / 2},${torsoTop + torsoL * 0.5}
          Q ${cx - hipW / 2 - 2},${torsoTop + torsoL * 0.75}
            ${cx - hipW / 2},${torsoBot}
          L ${cx + hipW / 2},${torsoBot}
          Q ${cx + hipW / 2 + 2},${torsoTop + torsoL * 0.75}
            ${cx + waistW / 2},${torsoTop + torsoL * 0.5}
          Q ${cx + chestW / 2 + 4},${torsoTop + torsoL * 0.25}
            ${cx + shoulderW / 2},${torsoTop}
          Z
        `}
        fill={fill}
        stroke={stroke}
        strokeWidth="1"
      />

      {/* Arms — simplified */}
      <rect
        x={cx - shoulderW / 2 - 8} y={torsoTop}
        width="8" height={torsoL * 0.7}
        rx="4"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.5"
      />
      <rect
        x={cx + shoulderW / 2} y={torsoTop}
        width="8" height={torsoL * 0.7}
        rx="4"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.5"
      />

      {/* Legs */}
      <rect
        x={cx - hipW / 2 + 2} y={legTop}
        width={hipW / 2 - 4} height={legL}
        rx="5"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.5"
      />
      <rect
        x={cx + 2} y={legTop}
        width={hipW / 2 - 4} height={legL}
        rx="5"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.5"
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const DEFAULT_MEASUREMENTS = {
  height:    165,
  weight:    65,
  chest:     88,
  waist:     72,
  hips:      96,
  shoulders: 42,
};

export default function MedidasPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [m, setM] = useState(DEFAULT_MEASUREMENTS);
  const [skinTone, setSkinTone] = useState<SkinTone | null>(null);
  const [consentSeen, setConsentSeen] = useState(false);
  const consentRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof typeof m) => (val: number) =>
    setM((prev) => ({ ...prev, [key]: val }));

  // IntersectionObserver para el banner de consentimiento
  useEffect(() => {
    if (!consentRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setConsentSeen(true); },
      { threshold: 0.8 },
    );
    obs.observe(consentRef.current);
    return () => obs.disconnect();
  }, []);

  const handleFinish = () => {
    startTransition(async () => {
      await apiFetch('/api/body-profile', {
        method: 'PUT',
        body:   JSON.stringify({
          height_cm:         m.height,
          weight_kg:         m.weight,
          chest_cm:          m.chest,
          waist_cm:          m.waist,
          hips_cm:           m.hips,
          shoulder_width_cm: m.shoulders,
          skin_tone:         skinTone,
        }),
      });
      document.cookie = 'onboarding_done=1; Path=/; Max-Age=31536000; SameSite=Lax';
      router.push('/');
    });
  };

  const handleSkip = () => {
    document.cookie = 'onboarding_done=1; Path=/; Max-Age=31536000; SameSite=Lax';
    router.push('/?welcome=1&remind_measurements=1');
  };

  return (
    <div className="space-y-8">
      <ProgressBar current={3} total={3} />

      {/* Consent banner — IntersectionObserver target */}
      <div
        ref={consentRef}
        className={cn(
          'rounded-[12px] p-4',
          'border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.06)]',
          'flex gap-3',
        )}
      >
        <Info size={18} className="text-[#C9A84C] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm text-[rgba(245,240,232,0.8)] leading-relaxed">
            Tus medidas se usan <strong className="text-[#F5F0E8]">únicamente</strong> para
            simular cómo te quedan las prendas. No se comparten con terceros ni se vinculan
            a tu identidad pública.
          </p>
          <a
            href="/privacidad"
            className="text-xs text-[#C9A84C] hover:text-[#B8942E] transition-colors"
          >
            Ver política completa →
          </a>
        </div>
      </div>

      <div className="space-y-1.5">
        <h1 className="font-display italic text-3xl text-[#F5F0E8]">Tu perfil de cuerpo</h1>
        <p className="text-sm text-[rgba(245,240,232,0.45)]">
          Ingresás tus medidas una sola vez. Podés actualizarlas cuando quieras.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Sliders */}
        <div className="space-y-6">
          <BodySlider label="Altura"            value={m.height}    min={140} max={210} unit="cm" onChange={set('height')} />
          <BodySlider label="Peso"              value={m.weight}    min={40}  max={150} unit="kg" onChange={set('weight')} />
          <BodySlider label="Contorno de pecho" value={m.chest}     min={60}  max={130} unit="cm" onChange={set('chest')} />
          <BodySlider label="Contorno de cintura" value={m.waist}   min={55}  max={120} unit="cm" onChange={set('waist')} />
          <BodySlider label="Contorno de cadera" value={m.hips}     min={65}  max={135} unit="cm" onChange={set('hips')} />
          <BodySlider label="Ancho de hombros"  value={m.shoulders} min={30}  max={60}  unit="cm" onChange={set('shoulders')} />

          <SkinTonePicker selected={skinTone} onChange={setSkinTone} />
        </div>

        {/* Mannequin preview */}
        <div className="flex flex-col items-center justify-start gap-4 sticky top-8">
          <div className="w-full rounded-[12px] bg-[#1C1714] border border-[rgba(255,255,255,0.05)] p-6 flex items-center justify-center min-h-[320px]">
            <Mannequin
              height={m.height}
              chest={m.chest}
              waist={m.waist}
              hips={m.hips}
              shoulders={m.shoulders}
              skinTone={skinTone}
            />
          </div>
          <p className="text-xs text-[rgba(245,240,232,0.25)] text-center">
            Preview aproximado basado en tus medidas
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={handleFinish}
          className="w-full"
          disabled={!consentSeen}
          loading={isPending}
        >
          {consentSeen ? 'Finalizar y entrar' : 'Scrolleá para leer el consentimiento'}
        </Button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={isPending}
          className="text-sm text-[rgba(245,240,232,0.35)] hover:text-[rgba(245,240,232,0.6)] transition-colors text-center disabled:opacity-30"
        >
          Completar más tarde
        </button>
      </div>
    </div>
  );
}
