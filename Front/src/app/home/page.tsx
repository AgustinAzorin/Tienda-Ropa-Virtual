import { ProductCard } from '@/components/catalog/ProductCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import Link from 'next/link';
import { Suspense } from 'react';

interface CatalogResponse {
  items?: Array<{
    id: string;
    slug: string;
    name: string;
    has_3d_model: boolean;
    stock?: number;
    images?: Array<{ url: string; alt_text?: string | null }>;
  }>;
}

async function getTrendingProducts() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  try {
    const response = await fetch(`${base}/api/catalog/products?per_page=12`, {
      next: { revalidate: 120 },
    });

    if (!response.ok) return [];
    const json = (await response.json()) as { data?: CatalogResponse };

    const items = json.data?.items ?? [];

    return items.map((item, index) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      has_3d_model: item.has_3d_model,
      stock: item.stock ?? 10,
      average_rating: 4 + (index % 5) / 10,
      reviews_count: 12 + index * 2,
      brand_name: 'Marca destacada',
      images: item.images ?? [],
    }));
  } catch {
    return [];
  }
}

async function HomeBento() {
  const products = await getTrendingProducts();
  const featured = products[0];
  const tryonPick = products.find((product) => product.has_3d_model) ?? products[1] ?? featured;
  const curatedPick = products[2] ?? featured;

  const collectionName = featured?.name ?? 'Editorial de Otono Urbano';
  const collectionImage = featured?.images?.[0]?.url;
  const tryonName = tryonPick?.name ?? 'Look adaptable a tu perfil corporal';
  const curatedName = curatedPick?.name ?? 'Capsula minimal de media estacion';

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_0.8fr]">
      <article className="group relative overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(145deg,#1C1714,#0D0A08)] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(201,168,76,0.24),transparent_52%),radial-gradient(circle_at_82%_80%,rgba(212,97,74,0.2),transparent_56%)]" />
        {collectionImage ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-40"
            style={{
              backgroundImage: `linear-gradient(120deg, rgba(13,10,8,0.94), rgba(13,10,8,0.68), rgba(13,10,8,0.9)), url(${collectionImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : null}
        <div className="relative z-10 flex min-h-[380px] flex-col justify-between gap-10">
          <div className="space-y-4">
            <span className="inline-flex h-11 items-center rounded-full border border-[#C9A84C]/70 bg-[rgba(201,168,76,0.16)] px-4 text-xs uppercase tracking-[0.2em] text-[#F5F0E8]">
              Coleccion destacada
            </span>
            <div className="max-w-2xl space-y-3">
              <h3 className="font-display text-4xl italic leading-tight text-[#F5F0E8] md:text-5xl">Detailed Collections</h3>
              <p className="text-base leading-relaxed text-[#F5F0E8]/74 md:max-w-xl">
                Una seleccion curada para combinar texturas, siluetas y capas sin perder comodidad diaria.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[#F5F0E8]/55">Pieza guia</p>
              <p className="font-display text-2xl italic text-[#F5F0E8] md:text-3xl">{collectionName}</p>
              <p className="text-sm text-[#F5F0E8]/68">Composiciones editoriales para pasar de inspiracion a compra en un solo flujo.</p>
            </div>
            <Link
              href="/explorar"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#C9A84C] bg-[#C9A84C] px-6 text-sm font-medium text-[#0D0A08] shadow-[0_14px_34px_rgba(0,0,0,0.42)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[#B8942E]"
            >
              Ver coleccion completa
            </Link>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
        <Link
          href="/probador"
          className="group relative overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(165deg,#18120F,#0D0A08)] p-6 shadow-[0_16px_36px_rgba(0,0,0,0.35)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#D4614A]/55"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,97,74,0.24),transparent_56%)]" />
          <div className="relative z-10 flex min-h-[176px] flex-col justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#D4614A]">Probador 3D</p>
              <h4 className="font-display text-2xl italic text-[#F5F0E8]">Visualizalo antes de comprar</h4>
              <p className="text-sm leading-relaxed text-[#F5F0E8]/72">Sugerido para hoy: {tryonName}</p>
            </div>
            <span className="inline-flex h-11 w-fit items-center rounded-full border border-[rgba(255,255,255,0.25)] px-4 text-sm text-[#F5F0E8] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-[#C9A84C]/70 group-hover:text-[#C9A84C]">
              Entrar al probador
            </span>
          </div>
        </Link>

        <Link
          href="/catalogo"
          className="group relative overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#C9A84C]/55"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(201,168,76,0.2),transparent_48%)]" />
          <div className="relative z-10 flex min-h-[176px] flex-col justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#C9A84C]">Curaduria semanal</p>
              <p className="font-display text-2xl italic leading-tight text-[#F5F0E8]">{curatedName}</p>
              <p className="text-sm text-[#F5F0E8]/72">Prioridad en cuotas: 3x $8.500 y total siempre visible en checkout.</p>
            </div>
            <span className="inline-flex h-11 w-fit items-center rounded-full border border-[#C9A84C]/65 bg-[rgba(201,168,76,0.14)] px-4 text-sm text-[#F5F0E8] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[rgba(201,168,76,0.22)]">
              Ir al catalogo
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

async function VibesSection() {
  const products = await getTrendingProducts();
  const picks = products.filter((product) => product.has_3d_model).slice(0, 4);
  const fallback = products.slice(0, 4);
  const personalized = picks.length > 0 ? picks : fallback;

  if (personalized.length === 0) {
    return (
      <div className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[#F5F0E8]/75">
        Estamos armando tus recomendaciones personalizadas. Mientras tanto, explora lo mas elegido de la semana.
        <Link href="/onboarding/perfil" className="ml-2 text-[#C9A84C] hover:text-[#B8942E]">
          Ir al perfil
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {personalized.map((product) => (
        <div key={product.id} className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-2">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[11px] uppercase tracking-wide text-[#F5F0E8]/65">Recomendado para vos</p>
            <span className="rounded-full border border-[#C9A84C]/60 bg-[rgba(201,168,76,0.12)] px-2 py-0.5 text-[10px] text-[#F5F0E8]">
              {product.has_3d_model ? '3D listo' : 'Top ventas'}
            </span>
          </div>
          <ProductCard product={product} showBadge3D />
        </div>
      ))}
    </div>
  );
}

async function MixedFeedSection() {
  const products = await getTrendingProducts();
  const socialSource = products.slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {socialSource.map((product, index) => (
        <div
          key={product.id}
          className="overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
        >
          {index === 0 ? (
            <div className="p-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-[#F5F0E8]/45">Comunidad</p>
              <h3 className="font-display text-xl italic">Styling real, cuerpo real</h3>
              <p className="mt-1 text-sm text-[#F5F0E8]/70">Inspirate con outfits etiquetados por vibe: fluido, oversized, minimal o estructurado.</p>
              <Link href="/explorar" className="mt-4 inline-flex text-sm text-[#C9A84C] hover:text-[#B8942E]">
                Ver inspiracion
              </Link>
            </div>
          ) : (
            <div className="p-2">
              <div className="mb-2 inline-flex rounded-full border border-[#D4614A]/60 bg-[rgba(212,97,74,0.12)] px-2 py-1 text-[11px] text-[#F5F0E8]">
                Look curado
              </div>
              <ProductCard product={product} showBadge3D />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.1)] bg-[linear-gradient(145deg,#1E1713,#0D0A08)] px-5 py-8 md:px-8 md:py-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.3),transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-24 -left-14 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(212,97,74,0.24),transparent_72%)]" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#C9A84C]">Home de compra personalizada</p>
              <h1 className="font-display text-4xl italic leading-tight text-[#F5F0E8] md:text-5xl">
                Tu estilo hoy, curado para comprar mejor.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-[#F5F0E8]/74 md:text-base">
                Descubri colecciones, probate prendas en 3D y encontrá recomendaciones alineadas con tu forma de vestir.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center rounded-full border border-[#C9A84C] bg-[#C9A84C] px-5 py-2 text-sm font-medium text-[#0D0A08] transition-colors hover:bg-[#B8942E]"
                >
                  Comprar ahora
                </Link>
                <Link
                  href="/probador"
                  className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.24)] bg-[rgba(255,255,255,0.03)] px-5 py-2 text-sm text-[#F5F0E8] transition-colors hover:border-[#C9A84C]/70 hover:text-[#C9A84C]"
                >
                  Ir al probador
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/explorar', label: 'Explorar', helper: 'Tendencias y vibes' },
                { href: '/catalogo', label: 'Catalogo', helper: 'Novedades y drops' },
                { href: '/guardarropas', label: 'Guardarropas', helper: 'Tus prendas guardadas' },
                { href: '/wishlist', label: 'Wishlist', helper: 'Lo que queres comprar' },
              ].map((shortcut) => (
                <Link
                  key={shortcut.href}
                  href={shortcut.href}
                  className="rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-3 transition-colors hover:border-[#C9A84C]/55 hover:bg-[rgba(201,168,76,0.08)]"
                >
                  <p className="font-display text-lg italic text-[#F5F0E8]">{shortcut.label}</p>
                  <p className="mt-1 text-xs text-[#F5F0E8]/65">{shortcut.helper}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl italic">Colecciones destacadas</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F5F0E8]/66">
                Descubri una composicion editorial pensada para explorar con calma, priorizando contexto visual antes de la decision de compra.
              </p>
            </div>
            <Link href="/explorar" className="text-sm text-[#C9A84C] hover:text-[#B8942E]">
              Ver todo
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_0.8fr]">
                <SkeletonCard className="h-[420px] rounded-[16px]" />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
                  <SkeletonCard className="h-[205px] rounded-[16px]" />
                  <SkeletonCard className="h-[205px] rounded-[16px]" />
                </div>
              </div>
            }
          >
            <HomeBento />
          </Suspense>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-3xl italic">Recomendado para vos</h2>
              <p className="text-sm text-[#F5F0E8]/62">Seleccionado con señales de uso y productos con alta afinidad.</p>
            </div>
            <Link href="/catalogo" className="text-sm text-[#C9A84C] hover:text-[#B8942E]">
              Ver catalogo
            </Link>
          </div>
          <Suspense fallback={<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>}>
            <VibesSection />
          </Suspense>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-3xl italic">Inspiracion social</h2>
              <p className="text-sm text-[#F5F0E8]/62">La comunidad acompana tu compra con ideas de styling real.</p>
            </div>
            <Link href="/explorar" className="text-sm text-[#C9A84C] hover:text-[#B8942E]">
              Ir a comunidad
            </Link>
          </div>
          <Suspense fallback={<div className="grid grid-cols-1 gap-3 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className="h-56" />)}</div>}>
            <MixedFeedSection />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
