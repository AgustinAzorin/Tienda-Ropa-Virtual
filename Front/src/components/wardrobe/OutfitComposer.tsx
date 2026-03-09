'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { Outfit, OutfitItem, Product } from '@/lib/tryon/types';

const STORAGE_KEY = 'anya_outfits_v1';

interface OutfitComposerProps {
  products: Product[];
}

function readOutfits(): Array<{ outfit: Outfit; items: OutfitItem[] }> {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Array<{ outfit: Outfit; items: OutfitItem[] }>;
  } catch {
    return [];
  }
}

export function OutfitComposer({ products }: OutfitComposerProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Mi nuevo outfit');
  const [visibility, setVisibility] = useState<'private' | 'followers' | 'public'>('private');
  const [selected, setSelected] = useState<Product[]>([]);

  const selectableProducts = useMemo(() => products.slice(0, 20), [products]);

  const onDragStart = (event: React.DragEvent<HTMLLIElement>, index: number) => {
    event.dataTransfer.setData('text/plain', String(index));
  };

  const onDrop = (event: React.DragEvent<HTMLLIElement>, targetIndex: number) => {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer.getData('text/plain'));
    if (!Number.isFinite(sourceIndex) || sourceIndex === targetIndex) return;

    setSelected((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const saveOutfit = () => {
    const itemsPayload = selected.map((product, index) => ({
      product_id: product.id,
      variant_id: product.variants[0]?.id ?? null,
      sort_order: index,
    }));

    void apiFetch('/api/outfits', {
      method: 'POST',
      body: JSON.stringify({
        name,
        is_public: visibility === 'public',
        items: itemsPayload,
      }),
    }).then(() => {
      router.push('/guardarropas?tab=outfits');
    }).catch(() => {
      // Local fallback so the composer remains usable if the API is unavailable.
      const outfitId = crypto.randomUUID();
      const outfit: Outfit = {
        id: outfitId,
        user_id: 'me',
        name,
        is_public: visibility === 'public',
        created_at: new Date().toISOString(),
      };

      const items: OutfitItem[] = selected.map((product, index) => ({
        id: crypto.randomUUID(),
        outfit_id: outfitId,
        product_id: product.id,
        variant_id: product.variants[0]?.id ?? null,
        sort_order: index,
        product,
      }));

      const current = readOutfits();
      current.unshift({ outfit, items });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      router.push('/guardarropas?tab=outfits');
    });
  };

  return (
    <main className="min-h-dvh px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <h1 className="font-display text-3xl italic">Nuevo outfit</h1>

        <div className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
          <p className="font-mono text-xs text-[#C9A84C]">Paso {step} de 4</p>

          {step === 1 ? (
            <div className="mt-3 space-y-2">
              <label htmlFor="outfit-name" className="text-sm text-[#F5F0E8]/80">Nombre del outfit</label>
              <input
                id="outfit-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[#0D0A08] px-3 py-2 text-sm"
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              {selectableProducts.map((product) => {
                const selectedItem = selected.some((item) => item.id === product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setSelected((prev) => selectedItem ? prev.filter((item) => item.id !== product.id) : [...prev, product]);
                    }}
                    className={selectedItem
                      ? 'rounded-[10px] border border-[#C9A84C] bg-[rgba(201,168,76,0.2)] p-2 text-xs'
                      : 'rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[#141010] p-2 text-xs'}
                  >
                    {product.name}
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === 3 ? (
            <ul className="mt-3 space-y-2">
              {selected.map((product, index) => (
                <li
                  key={product.id}
                  draggable
                  onDragStart={(event) => onDragStart(event, index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => onDrop(event, index)}
                  className="rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[#141010] px-3 py-2 text-sm"
                >
                  {product.name}
                </li>
              ))}
            </ul>
          ) : null}

          {step === 4 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {(['private', 'followers', 'public'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVisibility(option)}
                  className={visibility === option
                    ? 'rounded-[10px] border border-[#C9A84C] bg-[rgba(201,168,76,0.2)] px-3 py-2 text-xs'
                    : 'rounded-[10px] border border-[rgba(255,255,255,0.12)] px-3 py-2 text-xs'}
                >
                  {option === 'private' ? 'Privado' : option === 'followers' ? 'Solo seguidores' : 'Publico'}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              className="rounded-[8px] border border-[rgba(255,255,255,0.14)] px-3 py-1.5 text-xs"
              onClick={() => setStep((value) => Math.max(1, value - 1))}
            >
              Atras
            </button>

            {step < 4 ? (
              <button
                type="button"
                className="rounded-[8px] bg-[#C9A84C] px-3 py-1.5 text-xs font-semibold text-[#0D0A08]"
                onClick={() => setStep((value) => Math.min(4, value + 1))}
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                className="rounded-[8px] bg-[#C9A84C] px-3 py-1.5 text-xs font-semibold text-[#0D0A08]"
                onClick={saveOutfit}
              >
                Guardar outfit
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
