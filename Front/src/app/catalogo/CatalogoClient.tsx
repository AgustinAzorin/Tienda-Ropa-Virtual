'use client';

import { ProductCard } from '@/components/catalog/ProductCard';
import {
  FilterSidebar,
  type CatalogFilterState,
} from '@/components/catalog/FilterSidebar';
import { FilterBottomSheet } from '@/components/catalog/FilterBottomSheet';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { cn } from '@/lib/utils';
import { useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Option {
  id: string;
  name: string;
  slug?: string;
}

interface ProductItem {
  id: string;
  slug: string;
  name: string;
  has_3d_model: boolean;
  stock?: number;
  tags?: string[];
}

interface CatalogoClientProps {
  products: ProductItem[];
  total: number;
  categories: Option[];
  brands: Option[];
}

const ORDER_OPTIONS = [
  { value: 'mas_probados_3d', label: 'Mas probados en 3D', featured: true },
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'mas_resenas', label: 'Mas resenas' },
];

export function CatalogoClient({ products, total, categories, brands }: CatalogoClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filterState = useMemo<CatalogFilterState>(
    () => ({
      category: searchParams.get('categoryId') ?? undefined,
      brand: searchParams.get('brandId') ?? undefined,
      has3dModel: searchParams.get('has3dModel') === 'true',
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    }),
    [searchParams],
  );

  const [draftFilters, setDraftFilters] = useState<CatalogFilterState>(filterState);

  const updateUrl = (next: CatalogFilterState, order?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    const map: Record<string, string | undefined> = {
      categoryId: next.category,
      brandId: next.brand,
      has3dModel: next.has3dModel ? 'true' : undefined,
      minPrice: next.minPrice?.toString(),
      maxPrice: next.maxPrice?.toString(),
      order: order ?? searchParams.get('order') ?? undefined,
    };

    Object.entries(map).forEach(([key, value]) => {
      if (value && value.length > 0) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const activeOrder = searchParams.get('order') ?? 'mas_probados_3d';
  const seededMockItems = useMemo(() => {
    if (products.length === 0) return [];
    const picks: ProductItem[] = [];
    for (let i = 0; i < 3; i += 1) {
      picks.push(products[i % products.length]);
    }
    return picks;
  }, [products]);

  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <header className="space-y-2">
          <h1 className="font-display text-3xl italic">Catalogo</h1>
          <p className="text-sm text-[#F5F0E8]/65">{total} prendas disponibles</p>
        </header>

        <section className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ORDER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateUrl(draftFilters, option.value)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors',
                activeOrder === option.value
                  ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.15)] text-[#F5F0E8]'
                  : 'border-[rgba(255,255,255,0.12)] text-[#F5F0E8]/70',
              )}
            >
              {option.featured ? `★ ${option.label}` : option.label}
            </button>
          ))}
        </section>

        {seededMockItems.length > 0 ? (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl italic text-[#F5F0E8]">Mock Picks</h2>
              <p className="text-xs text-[#F5F0E8]/60">3 items demo con acciones</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {seededMockItems.map((product, index) => (
                <ProductCard
                  key={`seeded-${product.id}-${index}`}
                  product={{
                    ...product,
                    brand_name: 'Demo',
                    average_rating: 4.2,
                    reviews_count: 10 + index,
                  }}
                  categoryTags={['Demo', 'Catalogo']}
                  showBadge3D
                  showActions
                />
              ))}
            </div>
          </section>
        ) : null}

        <div className="flex items-start gap-4">
          <FilterSidebar
            categories={categories}
            brands={brands}
            value={draftFilters}
            onChange={setDraftFilters}
            onApply={() => updateUrl(draftFilters)}
            onClear={() => {
              const empty = { has3dModel: false } as CatalogFilterState;
              setDraftFilters(empty);
              updateUrl(empty);
            }}
          />

          <section className={cn('flex-1 transition-opacity duration-300 ease-out', isPending && 'opacity-55')}>
            {products.length === 0 ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 text-center">
                <p className="font-display text-2xl italic">No encontramos prendas con esos filtros</p>
                <button
                  type="button"
                  className="mt-3 text-sm text-[#C9A84C] hover:text-[#B8942E]"
                  onClick={() => {
                    const empty = { has3dModel: false } as CatalogFilterState;
                    setDraftFilters(empty);
                    updateUrl(empty);
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      brand_name: 'Catalogo',
                      average_rating: 4.1,
                      reviews_count: 18,
                    }}
                    categoryTags={product.tags?.length ? product.tags : ['Catalogo']}
                    showBadge3D
                    showActions
                  />
                ))}
              </div>
            )}

            {isPending && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Button onClick={() => setIsSheetOpen(true)}>Filtros</Button>
      </div>

      <FilterBottomSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        value={draftFilters}
        onChange={setDraftFilters}
        onApply={() => updateUrl(draftFilters)}
        onClear={() => {
          const empty = { has3dModel: false } as CatalogFilterState;
          setDraftFilters(empty);
          updateUrl(empty);
        }}
        categories={categories}
        brands={brands}
        resultCount={total}
      />
    </main>
  );
}
