'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Button } from '@/components/ui/Button';
import { useWishlistStore } from '@/lib/stores/wishlistStore';
import { useCartStore } from '@/lib/stores/cartStore';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Tab = 'active' | 'history';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveFirstVariantId(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/api/catalog/products/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const variants = (json?.data?.variants ?? []) as Array<{ id: string; stock?: number }>;
    const available = variants.find((variant) => (variant.stock ?? 0) > 0) ?? variants[0];
    if (!available?.id || !isUuid(available.id)) return null;
    return available.id;
  } catch {
    return null;
  }
}

export default function WishlistPage() {
  const [tab, setTab] = useState<Tab>('active');
  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const { active, history, hydrate, softDelete, restore, removePermanently } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const sortedActive = useMemo(
    () => [...active].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [active],
  );

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => +new Date(b.removedAt ?? b.createdAt) - +new Date(a.removedAt ?? a.createdAt)),
    [history],
  );

  const moveToCart = async (entryId: string, slug: string, triedOn3D: boolean) => {
    setMovingId(entryId);
    setMoveError(null);
    try {
      const variantId = await resolveFirstVariantId(slug);
      if (!variantId) {
        setMoveError('No hay variante disponible para agregar al carrito.');
        return;
      }
      const entry = active.find((item) => item.id === entryId);
      await addItem(variantId, 1, triedOn3D, {
        productName: entry?.product.name ?? 'Producto',
        thumbnail: entry?.product.images?.[0]?.url,
      });
      softDelete(entryId);
    } catch {
      setMoveError('No se pudo mover al carrito. Intentalo de nuevo.');
    } finally {
      setMovingId(null);
    }
  };

  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-4xl italic text-[#F5F0E8]">Wishlist</h1>
          <p className="text-sm text-[#F5F0E8]/65">
            Guarda prendas, movelas al carrito y recupera lo eliminado desde Historial.
          </p>
        </header>

        <div className="flex gap-2 border-b border-[rgba(255,255,255,0.08)] pb-2">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={tab === 'active'
              ? 'rounded-full border border-[#C9A84C] bg-[rgba(201,168,76,0.2)] px-3 py-1.5 text-xs font-semibold text-[#F5F0E8]'
              : 'rounded-full border border-[rgba(255,255,255,0.14)] px-3 py-1.5 text-xs text-[#F5F0E8]/70'}
          >
            Activos ({sortedActive.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={tab === 'history'
              ? 'rounded-full border border-[#D4614A] bg-[rgba(212,97,74,0.16)] px-3 py-1.5 text-xs font-semibold text-[#F5F0E8]'
              : 'rounded-full border border-[rgba(255,255,255,0.14)] px-3 py-1.5 text-xs text-[#F5F0E8]/70'}
          >
            Historial ({sortedHistory.length})
          </button>
        </div>

        {tab === 'active' ? (
          sortedActive.length ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedActive.map((entry) => (
                  <section key={entry.id} className="space-y-2 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-2">
                    <ProductCard
                      product={entry.product}
                      showBadge3D
                      categoryTags={entry.product.categoryTags ?? ['Wishlist']}
                    />
                    <div className="grid grid-cols-2 gap-2 px-1 pb-1">
                      <Button
                        size="sm"
                        variant="primary"
                        loading={movingId === entry.id}
                        onClick={() => void moveToCart(entry.id, entry.product.slug, entry.product.has_3d_model)}
                      >
                        Move to Cart
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => softDelete(entry.id)}>
                        Delete
                      </Button>
                    </div>
                  </section>
                ))}
              </div>

              {moveError ? <p className="text-xs text-[#D4614A]">{moveError}</p> : null}
            </>
          ) : (
            <section className="rounded-[14px] border border-dashed border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.02)] p-8 text-center">
              <p className="text-sm text-[#F5F0E8]/70">Tu wishlist activa esta vacia.</p>
            </section>
          )
        ) : sortedHistory.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedHistory.map((entry) => (
              <section key={entry.id} className="space-y-2 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-2">
                <ProductCard
                  product={entry.product}
                  showBadge3D
                  categoryTags={entry.product.categoryTags ?? ['Historial']}
                />
                <div className="grid grid-cols-2 gap-2 px-1 pb-1">
                  <Button size="sm" variant="secondary" onClick={() => restore(entry.id)}>
                    Restore
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removePermanently(entry.id)}>
                    Eliminar
                  </Button>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section className="rounded-[14px] border border-dashed border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.02)] p-8 text-center">
            <p className="text-sm text-[#F5F0E8]/70">No hay items en historial.</p>
          </section>
        )}
      </div>
    </main>
  );
}
