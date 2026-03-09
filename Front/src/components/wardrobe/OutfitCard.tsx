'use client';

import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { BadgeCheck, Pencil, Share2, Trash2 } from 'lucide-react';
import type { Outfit, OutfitItem } from '@/lib/tryon/types';

interface OutfitCardProps {
  outfit: Outfit;
  items: OutfitItem[];
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
  onOpenInTryon: () => void;
}

function MiniPreview() {
  return (
    <Canvas gl={{ antialias: true, alpha: false }} dpr={[1, 1.5]} camera={{ position: [0, 1.2, 2.4], fov: 42 }}>
      <color attach="background" args={['#0D0A08']} />
      <ambientLight intensity={0.4} color="#FFF5E6" />
      <directionalLight intensity={1.1} position={[2, 3, 2]} color="#FFE4C4" />
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.3, 1.1, 12, 18]} />
        <meshStandardMaterial color="#d9cec0" roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.22, 22, 22]} />
        <meshStandardMaterial color="#D4AF8B" roughness={0.6} />
      </mesh>
    </Canvas>
  );
}

export function OutfitCard({ outfit, items, onEdit, onShare, onDelete, onOpenInTryon }: OutfitCardProps) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPrice = items.reduce((acc, item) => {
    const value = Number(item.product?.price ?? 0);
    return acc + (Number.isFinite(value) ? value : 0);
  }, 0);

  const onPointerDown = () => {
    holdTimer.current = setTimeout(onOpenInTryon, 500);
  };

  const clearHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  return (
    <article
      className="group overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
      onPointerDown={onPointerDown}
      onPointerUp={clearHold}
      onPointerCancel={clearHold}
    >
      <div className="relative h-36">
        <MiniPreview />
        {outfit.is_public && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-[#C9A84C] bg-[rgba(201,168,76,0.2)] px-2 py-1 text-[10px] font-semibold text-[#F5F0E8]">
            <BadgeCheck size={12} /> Publico
          </span>
        )}
      </div>

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-1 text-sm font-medium">{outfit.name}</h3>
        <p className="text-xs text-[#F5F0E8]/70">{items.length} prendas · ARS {totalPrice.toFixed(2)}</p>

        <div className="flex items-center justify-between text-[#F5F0E8]/70">
          <button type="button" onClick={onEdit} aria-label="Editar outfit"><Pencil size={14} /></button>
          <button type="button" onClick={onShare} aria-label="Compartir outfit"><Share2 size={14} /></button>
          <button type="button" onClick={onOpenInTryon} aria-label="Abrir en probador">🧍</button>
          <button type="button" onClick={onDelete} aria-label="Eliminar outfit"><Trash2 size={14} /></button>
        </div>
      </div>
    </article>
  );
}
