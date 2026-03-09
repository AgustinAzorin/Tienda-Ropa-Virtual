'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassModal } from '@/components/ui/GlassModal';
import { apiFetch } from '@/lib/api';
import { detectDeviceTier, isWebGLSupported } from '@/lib/tryon/deviceDetection';
import { selectAssetForVariant } from '@/lib/tryon/modelLoader';
import { finishTryonSession, markTryonSessionAsCartConverted, startTryonSession } from '@/lib/tryon/sessionTracker';
import type { BodyProfile, Product, Product3DAsset, ProductVariant } from '@/lib/tryon/types';
import { BodySliders } from '@/components/tryon/BodySliders';
import { HeatmapLegend } from '@/components/tryon/HeatmapLegend';
import { ManiquiScene } from '@/components/tryon/ManiquiScene';
import { TryonControls } from '@/components/tryon/TryonControls';
import { TryonFallback } from '@/components/tryon/TryonFallback';
import { TryonLoading } from '@/components/tryon/TryonLoading';

interface TryonPageClientProps {
  productoId: string;
}

interface ProductByIdResponse {
  id: string;
  slug: string;
}

interface CartResponse {
  id: string;
}

function isProfileComplete(profile: BodyProfile | null): boolean {
  if (!profile) return false;
  return [
    profile.height_cm,
    profile.weight_kg,
    profile.chest_cm,
    profile.waist_cm,
    profile.hips_cm,
    profile.shoulder_width_cm,
  ].every((item) => item !== null && item !== undefined && Number(item) > 0);
}

export default function TryonPageClient({ productoId }: TryonPageClientProps) {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [bodyProfile, setBodyProfile] = useState<BodyProfile | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Product3DAsset | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSliders, setShowSliders] = useState(false);
  const [loadingScene, setLoadingScene] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [hasUnsavedOutfit, setHasUnsavedOutfit] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStart, setSessionStart] = useState<number>(Date.now());
  const [webglSupported, setWebglSupported] = useState(true);
  const [showPhotoPanel, setShowPhotoPanel] = useState(false);
  const [slowLoadHint, setSlowLoadHint] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [sceneCanvas, setSceneCanvas] = useState<HTMLCanvasElement | null>(null);
  const [pressureHover, setPressureHover] = useState<{ label: string; x: number; y: number } | null>(null);

  const isDesktop = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(min-width: 1024px)').matches;
  }, []);

  useEffect(() => {
    setWebglSupported(isWebGLSupported());
    detectDeviceTier();
    setIsOnline(navigator.onLine);

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loadingScene) setSlowLoadHint(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, [loadingScene]);

  useEffect(() => {
    if (!showHeatmap) {
      setPressureHover(null);
    }
  }, [showHeatmap]);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

    async function load() {
      const byId = await fetch(`${base}/api/catalog/products/${productoId}`, { cache: 'no-store' });
      if (!byId.ok) {
        router.push('/catalogo');
        return;
      }

      const byIdJson = (await byId.json()) as { data: ProductByIdResponse };
      const slug = byIdJson.data.slug;

      const detailRes = await fetch(`${base}/api/catalog/products/${slug}`, { cache: 'no-store' });
      if (!detailRes.ok) {
        router.push('/catalogo');
        return;
      }

      const detailJson = (await detailRes.json()) as { data: Product };
      const fullProduct = detailJson.data;

      if (!fullProduct.has_3d_model) {
        router.push(`/producto/${fullProduct.slug}`);
        return;
      }

      setProduct(fullProduct);
      setSelectedVariant(fullProduct.variants?.[0] ?? null);

      const profile = await apiFetch<BodyProfile | null>('/api/body-profile');
      if (!isProfileComplete(profile)) {
        router.push(`/onboarding/medidas?redirect=/probador/${productoId}`);
        return;
      }

      setBodyProfile(profile);
    }

    void load().catch(() => {
      router.push('/catalogo');
    });
  }, [productoId, router]);

  useEffect(() => {
    if (!product || !selectedVariant) return;
    setSelectedAsset(selectAssetForVariant(product.assets_3d, selectedVariant.id));
  }, [product, selectedVariant]);

  useEffect(() => {
    if (!product || !selectedVariant || !bodyProfile) return;

    let cancelled = false;
    setSessionStart(Date.now());

    void startTryonSession({
      product_id: product.id,
      variant_id: selectedVariant.id,
      bodyProfile,
    }).then((session) => {
      if (cancelled) return;
      setSessionId(session.id);
    }).catch(() => {
      // silent tracking error
    });

    return () => {
      cancelled = true;
    };
  }, [product, selectedVariant, bodyProfile]);

  useEffect(() => {
    return () => {
      if (!sessionId) return;
      const duration = Math.max(1, Math.round((Date.now() - sessionStart) / 1000));
      void finishTryonSession(sessionId, duration);
    };
  }, [sessionId, sessionStart]);

  const onLoadStart = useCallback(() => {
    setLoadingScene(true);
    setLoadingProgress(10);
  }, []);

  const onLoadComplete = useCallback(() => {
    setLoadingProgress(100);
    setTimeout(() => setLoadingScene(false), 250);
  }, []);

  const onLoadError = useCallback(() => {
    setLoadingScene(false);
  }, []);

  const onCloseTryon = useCallback(() => {
    if (hasUnsavedOutfit) {
      setShowCloseModal(true);
      return;
    }

    if (product) {
      router.push(`/producto/${product.slug}`);
    } else {
      router.push('/catalogo');
    }
  }, [hasUnsavedOutfit, product, router]);

  const captureSceneBlob = useCallback(async (): Promise<Blob | null> => {
    if (!sceneCanvas) return null;

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        sceneCanvas.toBlob((value) => resolve(value), 'image/png', 0.95);
      });

      return blob;
    } catch {
      return null;
    }
  }, [sceneCanvas]);

  const onShareTryon = useCallback(async () => {
    if (!product) return;

    const blob = await captureSceneBlob();
    const file = blob ? new File([blob], `look-${product.slug}.png`, { type: 'image/png' }) : null;

    if (navigator.share && file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `Mi look: ${product.name}`,
          text: `Mira como queda ${product.name} en el probador virtual.`,
          files: [file],
        });
        return;
      } catch {
        // Ignore cancel/error and continue with fallback.
      }
    }

    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `look-${product.slug}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
      return;
    }

    router.push('/guardarropas?nuevo=1');
  }, [captureSceneBlob, product, router]);

  const onAddToCart = useCallback(async () => {
    if (!selectedVariant) return;

    const storedCartId = typeof window !== 'undefined' ? localStorage.getItem('tv_cart_id') : null;

    try {
      const cart = await apiFetch<CartResponse>(`/api/cart${storedCartId ? `?cartId=${storedCartId}` : ''}`);
      if (cart?.id) {
        localStorage.setItem('tv_cart_id', cart.id);
      }

      await apiFetch('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          cartId: cart.id,
          variantId: selectedVariant.id,
          quantity: 1,
        }),
      });

      if (sessionId) {
        void markTryonSessionAsCartConverted(sessionId);
      }

      setHasUnsavedOutfit(true);
    } catch {
      // Keep UX responsive even if cart API fails.
      setHasUnsavedOutfit(true);
    }
  }, [selectedVariant, sessionId]);

  if (!webglSupported) {
    return <TryonFallback images={product?.images} />;
  }

  if (!product || !bodyProfile || !selectedVariant) {
    return <TryonLoading progress={loadingProgress} />;
  }

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#0D0A08]">
      <div className={loadingScene ? 'opacity-0 transition-opacity duration-500' : 'opacity-100 transition-opacity duration-500'}>
        <ManiquiScene
          bodyProfile={bodyProfile}
          clothingAsset={selectedAsset}
          selectedVariant={selectedVariant}
          showHeatmap={showHeatmap}
          onCanvasReady={setSceneCanvas}
          onPressureHover={setPressureHover}
          onLoadStart={onLoadStart}
          onLoadComplete={onLoadComplete}
          onLoadError={onLoadError}
        />
      </div>

      {loadingScene && <TryonLoading progress={loadingProgress} />}

      {showHeatmap && <HeatmapLegend />}

      <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={onCloseTryon}
          className="h-10 w-10 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(13,10,8,0.7)] text-[#F5F0E8]"
          aria-label="Cerrar probador"
        >
          X
        </button>

        <button
          type="button"
          onClick={() => setShowSliders((value) => !value)}
          className="rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(13,10,8,0.7)] px-3 py-2 text-xs text-[#F5F0E8]"
        >
          Ajustar figura
        </button>
      </div>

      <button
        type="button"
        className="absolute right-3 top-3 z-20 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(13,10,8,0.7)] px-3 py-2 text-xs text-[#F5F0E8]"
        onClick={() => {
          void onShareTryon();
        }}
      >
        Compartir
      </button>

      {showHeatmap && pressureHover ? (
        <div
          className="pointer-events-none absolute z-30 rounded-[8px] border border-[rgba(255,255,255,0.2)] bg-[rgba(13,10,8,0.82)] px-2 py-1 text-[11px] font-semibold text-[#F5F0E8]"
          style={{
            left: `${((pressureHover.x + 1) / 2) * 100}%`,
            top: `${((1 - pressureHover.y) / 2) * 100}%`,
            transform: 'translate(10px, -16px)',
          }}
        >
          {pressureHover.label}
        </div>
      ) : null}

      {(showSliders || isDesktop) && (
        <div className={isDesktop
          ? 'absolute bottom-0 left-0 top-0 z-20 w-[340px]'
          : 'absolute bottom-0 left-0 top-0 z-20 w-[88%] max-w-sm animate-slide-up'}>
          <BodySliders
            bodyProfile={bodyProfile}
            onChange={(updated) => {
              setHasUnsavedOutfit(true);
              setBodyProfile((prev) => (prev ? { ...prev, ...updated } : prev));
            }}
            onSave={async () => {
              if (!bodyProfile) return;
              await apiFetch('/api/body-profile', {
                method: 'PUT',
                body: JSON.stringify(bodyProfile),
              });
              setHasUnsavedOutfit(false);
            }}
          />
        </div>
      )}

      <div className={isDesktop
        ? 'absolute bottom-0 right-0 top-0 z-20 w-[320px] p-3'
        : 'absolute inset-x-0 bottom-0 z-20'}>
        <TryonControls
          product={product}
          variants={product.variants}
          selectedVariant={selectedVariant}
          onVariantChange={(variant) => {
            setSelectedVariant(variant);
            setHasUnsavedOutfit(true);
          }}
          showHeatmap={showHeatmap}
          onToggleHeatmap={() => setShowHeatmap((value) => !value)}
          onAddToCart={() => {
            void onAddToCart();
          }}
          onSaveToWardrobe={() => {
            setHasUnsavedOutfit(false);
            router.push('/guardarropas?nuevo=1');
          }}
          onShare={() => {
            void onShareTryon();
          }}
        />
      </div>

      {slowLoadHint && loadingScene ? (
        <button
          type="button"
          className="absolute bottom-40 right-4 z-20 rounded-[10px] border border-[rgba(255,255,255,0.2)] bg-[rgba(13,10,8,0.72)] px-3 py-2 text-xs text-[#F5F0E8]"
          onClick={() => setShowPhotoPanel((value) => !value)}
        >
          Ver fotos mientras carga
        </button>
      ) : null}

      {showPhotoPanel && (
        <aside className="absolute right-0 top-0 z-30 h-full w-[70%] max-w-xs overflow-y-auto border-l border-[rgba(255,255,255,0.08)] bg-[rgba(13,10,8,0.92)] p-3">
          <h3 className="font-display text-lg italic">Fotos del producto</h3>
          <div className="mt-3 space-y-2">
            {(product.images ?? []).map((image) => (
              <img
                key={image.id ?? image.url}
                src={image.url}
                alt={image.alt_text ?? product.name}
                className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)]"
              />
            ))}
          </div>
        </aside>
      )}

      <GlassModal open={showCloseModal} onClose={() => setShowCloseModal(false)} size="sm">
        <div className="space-y-4">
          <h3 className="font-display text-xl italic">Salir sin guardar tu outfit?</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="rounded-[8px] bg-[#C9A84C] px-3 py-2 text-sm font-semibold text-[#0D0A08]"
              onClick={() => {
                setShowCloseModal(false);
                setHasUnsavedOutfit(false);
                router.push('/guardarropas?nuevo=1');
              }}
            >
              Guardar y salir
            </button>
            <button
              type="button"
              className="rounded-[8px] border border-[rgba(255,255,255,0.16)] px-3 py-2 text-sm text-[#F5F0E8]"
              onClick={() => {
                setShowCloseModal(false);
                if (product) router.push(`/producto/${product.slug}`);
              }}
            >
              Salir igual
            </button>
          </div>
        </div>
      </GlassModal>

      {!isOnline && !product.assets_3d?.length ? (
        <div className="absolute inset-x-4 bottom-28 z-30 rounded-[10px] border border-[rgba(255,255,255,0.16)] bg-[rgba(13,10,8,0.9)] p-3 text-xs text-[#F5F0E8]/80">
          Necesitas conexion para cargar el probador por primera vez.
        </div>
      ) : null}
    </main>
  );
}
