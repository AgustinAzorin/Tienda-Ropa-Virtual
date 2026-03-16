import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function HomeLoading() {
  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <section className="rounded-[16px] border border-[rgba(255,255,255,0.1)] bg-[linear-gradient(145deg,#1E1713,#0D0A08)] px-5 py-8 md:px-8 md:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <div className="skeleton h-4 w-44" />
              <div className="skeleton h-14 w-full max-w-[480px]" />
              <div className="skeleton h-5 w-full max-w-[520px]" />
              <div className="flex gap-3 pt-1">
                <div className="skeleton h-10 w-32 rounded-full" />
                <div className="skeleton h-10 w-32 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} className="h-24" />
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="skeleton h-9 w-72" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[160px] md:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="min-h-[160px]" />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="skeleton h-9 w-72" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="skeleton h-9 w-64" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} className="h-56" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
