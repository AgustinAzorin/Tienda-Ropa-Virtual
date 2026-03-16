'use client';

import { useMemo, useState } from 'react';

interface WardrobeItem {
  id: string;
  name: string;
  brand: string;
  size: string;
  imageUrl: string;
  purchasedAt: string;
}

const INITIAL_PURCHASED_ITEMS: WardrobeItem[] = [
  {
    id: 'sample-overshirt-001',
    name: 'Sobrecamisa Cordoba Terracota',
    brand: 'Estudio Andino',
    size: 'M',
    imageUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=900&q=80',
    purchasedAt: 'Compra verificada',
  },
];

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onTryOn: (item: WardrobeItem) => void;
  onHide?: (itemId: string) => void;
  onRestore?: (itemId: string) => void;
  hidden?: boolean;
}

function WardrobeItemCard({ item, onTryOn, onHide, onRestore, hidden = false }: WardrobeItemCardProps) {
  return (
    <article className="group overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[linear-gradient(150deg,#1C1714,#0D0A08)]">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(13,10,8,0.75),transparent_55%)]" />

        <div className="absolute left-3 top-3 inline-flex items-center rounded-full border border-[#C9A84C]/70 bg-[rgba(201,168,76,0.15)] px-2.5 py-1 text-[11px] uppercase tracking-wide text-[#F5F0E8]">
          Comprada
        </div>

        {!hidden ? (
          <button
            type="button"
            onClick={() => onHide?.(item.id)}
            className="absolute right-3 top-3 rounded-full border border-[rgba(255,255,255,0.26)] bg-[rgba(13,10,8,0.75)] px-2.5 py-1 text-[11px] text-[#F5F0E8] transition-colors hover:border-[#D4614A]/70 hover:text-[#D4614A]"
            aria-label={`Ocultar ${item.name}`}
          >
            Hide
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onRestore?.(item.id)}
            className="absolute right-3 top-3 rounded-full border border-[rgba(255,255,255,0.26)] bg-[rgba(13,10,8,0.75)] px-2.5 py-1 text-[11px] text-[#F5F0E8] transition-colors hover:border-[#C9A84C]/70 hover:text-[#C9A84C]"
            aria-label={`Restaurar ${item.name}`}
          >
            Restore
          </button>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#F5F0E8]/62">{item.brand}</p>
          <h3 className="mt-1 font-display text-xl italic leading-tight text-[#F5F0E8]">{item.name}</h3>
          <p className="mt-1 text-xs text-[#F5F0E8]/64">{item.purchasedAt} · Talle {item.size}</p>
        </div>

        <button
          type="button"
          onClick={() => onTryOn(item)}
          className="inline-flex h-10 w-full items-center justify-center rounded-[10px] border border-[#D4614A]/70 bg-[rgba(212,97,74,0.12)] text-sm font-medium text-[#F5F0E8] transition-colors hover:bg-[rgba(212,97,74,0.2)]"
        >
          Try On
        </button>
      </div>
    </article>
  );
}

export default function GuardarropasClient() {
  const [visibleItems, setVisibleItems] = useState<WardrobeItem[]>(INITIAL_PURCHASED_ITEMS);
  const [hiddenItems, setHiddenItems] = useState<WardrobeItem[]>([]);
  const [actionMessage, setActionMessage] = useState<string>('');

  const totalItems = useMemo(
    () => visibleItems.length + hiddenItems.length,
    [visibleItems.length, hiddenItems.length],
  );

  const handleTryOn = (item: WardrobeItem) => {
    setActionMessage(`Placeholder activo: ${item.name} listo para Try On cuando se habilite el maniqui.`);
  };

  const handleHide = (itemId: string) => {
    const itemToHide = visibleItems.find((item) => item.id === itemId);
    if (!itemToHide) return;

    setVisibleItems((current) => current.filter((item) => item.id !== itemId));
    setHiddenItems((current) => {
      if (current.some((item) => item.id === itemId)) return current;
      return [itemToHide, ...current];
    });
    setActionMessage(`${itemToHide.name} fue movida a Hidden Items.`);
  };

  const handleRestore = (itemId: string) => {
    const itemToRestore = hiddenItems.find((item) => item.id === itemId);
    if (!itemToRestore) return;

    setHiddenItems((current) => current.filter((item) => item.id !== itemId));
    setVisibleItems((current) => {
      if (current.some((item) => item.id === itemId)) return current;
      return [itemToRestore, ...current];
    });
    setActionMessage(`${itemToRestore.name} volvio al listado principal.`);
  };

  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-7">
        <section className="relative overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.1)] bg-[linear-gradient(150deg,#1E1713,#0D0A08)] p-5 md:p-7">
          <div className="pointer-events-none absolute -right-10 -top-8 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.28),transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(212,97,74,0.2),transparent_72%)]" />

          <div className="relative z-10 space-y-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[#C9A84C]">Wardrobe</p>
              <h1 className="font-display text-4xl italic leading-tight text-[#F5F0E8] md:text-5xl">
                Prendas compradas para volver a probar
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[#F5F0E8]/72 md:text-base">
                Gestiona tus piezas compradas, decide que ocultar del listado principal y manten todo listo para probar en maniqui cuando el modulo este activo.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-[12px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] p-3">
                <p className="text-[11px] uppercase tracking-wider text-[#F5F0E8]/62">Total</p>
                <p className="mt-1 font-mono text-2xl text-[#F5F0E8]">{totalItems}</p>
              </div>
              <div className="rounded-[12px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] p-3">
                <p className="text-[11px] uppercase tracking-wider text-[#F5F0E8]/62">Visibles</p>
                <p className="mt-1 font-mono text-2xl text-[#C9A84C]">{visibleItems.length}</p>
              </div>
              <div className="rounded-[12px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] p-3">
                <p className="text-[11px] uppercase tracking-wider text-[#F5F0E8]/62">Ocultas</p>
                <p className="mt-1 font-mono text-2xl text-[#D4614A]">{hiddenItems.length}</p>
              </div>
            </div>
          </div>
        </section>

        {actionMessage ? (
          <p className="rounded-[10px] border border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.1)] px-3 py-2 text-sm text-[#F5F0E8]">
            {actionMessage}
          </p>
        ) : null}

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl italic text-[#F5F0E8]">Prendas activas</h2>
              <p className="text-sm text-[#F5F0E8]/65">Tu grilla principal de compradas listas para usar.</p>
            </div>
          </div>

          {visibleItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map((item) => (
                <WardrobeItemCard
                  key={item.id}
                  item={item}
                  onTryOn={handleTryOn}
                  onHide={handleHide}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[14px] border border-dashed border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.02)] p-6 text-sm text-[#F5F0E8]/68">
              No hay prendas visibles en este momento. Puedes restaurar desde Hidden Items.
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="font-display text-3xl italic text-[#F5F0E8]">Hidden Items</h2>
            <p className="text-sm text-[#F5F0E8]/65">Items ocultados manualmente desde tu listado principal.</p>
          </div>

          {hiddenItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {hiddenItems.map((item) => (
                <WardrobeItemCard
                  key={item.id}
                  item={item}
                  onTryOn={handleTryOn}
                  onRestore={handleRestore}
                  hidden
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] p-6 text-sm text-[#F5F0E8]/62">
              Aun no ocultaste prendas. Usa el boton Hide en cualquier card para enviarla aqui.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
