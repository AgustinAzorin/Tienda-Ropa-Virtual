'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { OutfitCard } from '@/components/wardrobe/OutfitCard';
import { TryonHistory } from '@/components/wardrobe/TryonHistory';
import { WishlistGrid } from '@/components/wardrobe/WishlistGrid';
import { apiFetch } from '@/lib/api';
import type { Outfit, OutfitItem, Product, SaveItem, TryonSession } from '@/lib/tryon/types';

const STORAGE_KEY = 'anya_outfits_v1';

type Tab = 'outfits' | 'probadas' | 'guardadas';

interface GuardarropasClientProps {
  initialTryonSessions: TryonSession[];
  initialSaves: SaveItem[];
  saveProducts: Product[];
  initialTab: Tab;
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

export default function GuardarropasClient({
  initialTryonSessions,
  initialSaves,
  saveProducts,
  initialTab,
}: GuardarropasClientProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [tryonSessions, setTryonSessions] = useState<TryonSession[]>(initialTryonSessions);
  const [saves, setSaves] = useState<SaveItem[]>(initialSaves);
  const [outfits, setOutfits] = useState<Array<{ outfit: Outfit; items: OutfitItem[] }>>(() => readOutfits());

  useEffect(() => {
    void apiFetch<TryonSession[]>('/api/tryon/sessions')
      .then(setTryonSessions)
      .catch(() => {
        // keep server fallback
      });

    void apiFetch<SaveItem[]>('/api/social/saves')
      .then(setSaves)
      .catch(() => {
        // keep server fallback
      });

    void apiFetch<Array<{ outfit: Outfit; items: OutfitItem[] }>>('/api/outfits')
      .then((rows) => {
        setOutfits(rows);
      })
      .catch(() => {
        // keep local fallback state
      });
  }, []);

  const mappedSaves = useMemo(() => {
    return saves.map((save) => ({
      ...save,
      product: saveProducts.find((product) => product.id === save.product_id),
    }));
  }, [saveProducts, saves]);

  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex items-center justify-between gap-2">
          <h1 className="font-display text-4xl italic">Mi guardarropas</h1>
          <Link
            href="/guardarropas/nuevo"
            className="rounded-[10px] bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#0D0A08]"
          >
            Nuevo outfit +
          </Link>
        </header>

        <div className="flex gap-2 border-b border-[rgba(255,255,255,0.08)] pb-2">
          {[
            ['outfits', 'Mis outfits'],
            ['probadas', 'Probadas'],
            ['guardadas', 'Guardadas'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id as Tab)}
              className={tab === id
                ? 'rounded-full border border-[#C9A84C] bg-[rgba(201,168,76,0.2)] px-3 py-1.5 text-xs font-semibold text-[#F5F0E8]'
                : 'rounded-full border border-[rgba(255,255,255,0.14)] px-3 py-1.5 text-xs text-[#F5F0E8]/70'}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'outfits' ? (
          outfits.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {outfits
                .sort((a, b) => +new Date(b.outfit.created_at) - +new Date(a.outfit.created_at))
                .map(({ outfit, items }) => (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    items={items}
                    onEdit={() => {
                      // placeholder edit action
                    }}
                    onShare={() => {
                      // placeholder share action
                    }}
                    onOpenInTryon={() => {
                      const first = items[0];
                      if (first) window.location.href = `/probador/${first.product_id}`;
                    }}
                    onDelete={() => {
                      void apiFetch(`/api/outfits/${outfit.id}`, {
                        method: 'DELETE',
                      }).finally(() => {
                        const next = outfits.filter((entry) => entry.outfit.id !== outfit.id);
                        setOutfits(next);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                      });
                    }}
                  />
                ))}
            </div>
          ) : (
            <section className="rounded-[14px] border border-dashed border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.02)] p-8 text-center">
              <p className="text-sm text-[#F5F0E8]/70">Todavia no guardaste ningun outfit</p>
              <Link
                href="/catalogo?has_3d_model=true"
                className="mt-3 inline-block rounded-[8px] bg-[#C9A84C] px-3 py-2 text-xs font-semibold text-[#0D0A08]"
              >
                Probate algo
              </Link>
            </section>
          )
        ) : null}

        {tab === 'probadas' ? <TryonHistory sessions={tryonSessions} /> : null}

        {tab === 'guardadas' ? (
          <WishlistGrid
            saves={mappedSaves}
            onRemove={() => {
              // remove flow will be connected to API in next iteration
            }}
          />
        ) : null}
      </div>
    </main>
  );
}
