'use client';

import { FilterChips, type FilterChipOption } from '@/components/catalog/FilterChips';
import { ProductCard } from '@/components/catalog/ProductCard';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { InfiniteScroll } from '@/components/ui/InfiniteScroll';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { apiFetch } from '@/lib/api';
import { debounce } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ExploreProduct {
  id: string;
  slug: string;
  name: string;
  has_3d_model: boolean;
  images?: Array<{ url: string; alt_text?: string | null }>;
}

interface CatalogListResponse {
  items: ExploreProduct[];
  total: number;
}

const FILTERS: FilterChipOption[] = [
  { value: 'tiene_3d', label: 'Tiene modelo 3D', icon: '🧍', is3d: true },
  { value: 'remeras', label: 'Remeras' },
  { value: 'pantalones', label: 'Pantalones' },
  { value: 'vestidos', label: 'Vestidos' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'fluido', label: 'Fluido' },
  { value: 'oversized', label: 'Oversized' },
  { value: 'hasta_10k', label: 'Hasta $10k' },
  { value: 'hasta_30k', label: 'Hasta $30k' },
  { value: 'hasta_50k', label: 'Hasta $50k' },
  { value: 'mas_50k', label: 'Mas de $50k' },
];

const SEARCH_TABS = ['Productos', 'Posts', 'Personas'] as const;
type SearchTab = (typeof SEARCH_TABS)[number];

export function ExplorarClient() {
  const [query, setQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [products, setProducts] = useState<ExploreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>('Productos');

  const debounceSearch = useRef(
    debounce(async (value: string) => {
      await loadProducts(value, false);
    }, 300),
  ).current;

  const loadProducts = useCallback(async (search: string, append: boolean) => {
    if (!append) setLoading(true);

    try {
      const has3d = selectedFilters.includes('tiene_3d');
      const result = await apiFetch<CatalogListResponse>(
        `/api/catalog/products?search=${encodeURIComponent(search)}&inStock=true&per_page=12${has3d ? '&has3dModel=true' : ''}`,
      );

      const incoming = result.items ?? [];
      setProducts((prev) => (append ? [...prev, ...incoming] : incoming));
      setHasMore(incoming.length >= 10);
    } catch {
      if (!append) setProducts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [selectedFilters]);

  useEffect(() => {
    const saved = sessionStorage.getItem('explore-search-tab');
    if (saved && SEARCH_TABS.includes(saved as SearchTab)) {
      setActiveTab(saved as SearchTab);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('explore-search-tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    void loadProducts('', false);
  }, [loadProducts]);

  const onSearchChange = (value: string) => {
    setQuery(value);
    setOpenDropdown(value.length > 0);
    debounceSearch(value);
  };

  const bentoItems = useMemo(
    () =>
      products.map((product, index) => ({
        id: `${product.id}-${index}`,
        content: <ProductCard product={{ ...product, brand_name: 'Explorar', stock: 8 }} showBadge3D />,
      })),
    [products],
  );

  const loadMore = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    await loadProducts(query, true);
  };

  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="relative">
          <input
            value={query}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setOpenDropdown(query.length > 0)}
            placeholder="Busca prendas, estilos, personas..."
            className="h-12 w-full rounded-[8px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-4 text-sm text-[#F5F0E8] outline-none transition-all duration-300 focus:border-[#C9A84C]"
          />

          {openDropdown && (
            <div className="glass absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-[12px] p-3">
              <div className="mb-3 flex gap-2">
                {SEARCH_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                      activeTab === tab
                        ? 'border border-[#C9A84C] bg-[rgba(201,168,76,0.15)] text-[#F5F0E8]'
                        : 'border border-[rgba(255,255,255,0.1)] text-[#F5F0E8]/65'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#F5F0E8]/60">
                Resultados en tiempo real. Presiona Enter para ver resultados completos.
              </p>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <FilterChips filters={FILTERS} selected={selectedFilters} onChange={setSelectedFilters} scrollable />
          {selectedFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedFilters([])}
              className="text-xs text-[#F5F0E8]/70 underline-offset-2 hover:text-[#F5F0E8] hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </section>

        <section className="space-y-3">
          <h1 className="font-display text-3xl italic">Explorar</h1>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              <BentoGrid items={bentoItems} layout="discovery" />
              <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} isLoading={isFetchingMore} className="py-6" />
            </>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-2xl italic">Tendencias esta semana</h2>
          <FilterChips
            filters={[
              { value: 'minimal', label: 'Minimal (284)' },
              { value: 'oversized', label: 'Oversized (198)' },
              { value: 'fluido', label: 'Fluido (167)' },
            ]}
            selected={selectedFilters}
            onChange={setSelectedFilters}
            scrollable
          />
        </section>
      </div>
    </main>
  );
}
