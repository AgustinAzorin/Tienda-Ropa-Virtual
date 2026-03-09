import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function HomeLoading() {
  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <section className="space-y-3">
          <div className="skeleton h-9 w-36" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[160px] md:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="min-h-[160px]" />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="skeleton h-8 w-52" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
